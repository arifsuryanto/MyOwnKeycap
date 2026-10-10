from fastapi import FastAPI, Depends, HTTPException, status
from .schemas import KeycapGenerateParams, KeycapResponse
from .auth import verify_shared_secret
from .generator.cherry import generate_cherry_mesh
from .generator.oem import generate_oem_mesh
from .validator import validate_mesh
from .export import export_all_formats, upload_keycap_assets

app = FastAPI(
    title="Keycap CAD Microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "cad"}

@app.post("/v1/keycap", response_model=KeycapResponse)
def generate_keycap(
    params: KeycapGenerateParams,
    _: bool = Depends(verify_shared_secret),
):
    # 1. Select generator based on profile
    if params.profile == "OEM":
        mesh = generate_oem_mesh(params)
    else:
        mesh = generate_cherry_mesh(params)

    # 2. Run geometric and manufacturing validator
    metrics = validate_mesh(mesh, material=params.material, min_wall_target=params.wall_mm)
    if not metrics.valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Keycap mesh failed validation", "errors": metrics.errors},
        )

    # 3. Export assets
    assets = export_all_formats(mesh)

    # 4. Upload to S3
    uploaded = upload_keycap_assets(params.spec_hash, params.key_id, assets)

    return KeycapResponse(
        key_id=params.key_id,
        spec_hash=params.spec_hash,
        stl_url=uploaded.get("stl_key"),
        glb_url=uploaded.get("glb_key"),
        threemf_url=uploaded.get("threemf_key"),
        metrics=metrics,
    )
