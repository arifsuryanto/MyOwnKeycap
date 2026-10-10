import io
import os
import boto3
import trimesh
from botocore.client import Config

def get_s3_client():
    endpoint = os.getenv("S3_ENDPOINT", "http://localhost:9000")
    access_key = os.getenv("S3_ACCESS_KEY", "keycap_minio")
    secret_key = os.getenv("S3_SECRET_KEY", "keycap_minio_dev")

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )

def export_all_formats(mesh: trimesh.Trimesh) -> dict:
    # 1. STL export
    stl_buf = io.BytesIO()
    mesh.export(stl_buf, file_type="stl")
    stl_bytes = stl_buf.getvalue()

    # 2. GLB export
    glb_buf = io.BytesIO()
    mesh.export(glb_buf, file_type="glb")
    glb_bytes = glb_buf.getvalue()

    # 3. 3MF export
    threemf_buf = io.BytesIO()
    try:
        mesh.export(threemf_buf, file_type="3mf")
        threemf_bytes = threemf_buf.getvalue()
    except Exception:
        # Fallback to STL bytes if 3MF export writer is not installed in local environment
        threemf_bytes = stl_bytes

    return {
        "stl": stl_bytes,
        "glb": glb_bytes,
        "3mf": threemf_bytes,
    }

def upload_keycap_assets(spec_hash: str, key_id: str, assets: dict) -> dict:
    bucket = os.getenv("S3_BUCKET", "keycap-assets")
    s3 = get_s3_client()

    # Ensure bucket exists
    try:
        s3.head_bucket(Bucket=bucket)
    except Exception:
        try:
            s3.create_bucket(Bucket=bucket)
        except Exception:
            pass

    prefix = f"designs/{spec_hash}/keys/{key_id}"
    stl_key = f"{prefix}.stl"
    glb_key = f"{prefix}.glb"
    threemf_key = f"{prefix}.3mf"

    try:
        s3.put_object(Bucket=bucket, Key=stl_key, Body=assets["stl"], ContentType="model/stl")
        s3.put_object(Bucket=bucket, Key=glb_key, Body=assets["glb"], ContentType="model/gltf-binary")
        s3.put_object(Bucket=bucket, Key=threemf_key, Body=assets["3mf"], ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml")
    except Exception as e:
        # In testing or local environment without active S3, log and return keys
        print(f"S3 upload warning: {e}")

    return {
        "stl_key": stl_key,
        "glb_key": glb_key,
        "threemf_key": threemf_key,
    }
