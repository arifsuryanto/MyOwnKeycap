"""02_import_fit.py - Impor mesh hasil generator, bersihkan, skala ke lebar target (mm), taruh di Z>=0.
Hasil: objek 'CatHead' (origin di tengah XY, dasar di Z=0)."""
import bpy, bmesh, math, os

PARAMS = dict(
    FILEPATH=r"C:\keycap\cat_v1.glb",   # ubah: .glb/.gltf/.obj/.stl/.fbx
    TARGET_WIDTH_MM=16.5,               # lebar kepala (sumbu X) setelah skala
    ROTATE_DEG=(0, 0, 0),               # koreksi orientasi (X, Y, Z) derajat; depan harus -Y
    MERGE_DIST_MM=0.005,
    VOXEL_REMESH_MM=0.0,                # 0 = nonaktif; coba 0.04 jika mesh berlubang atau self-intersect
    OBJ_NAME="CatHead",
)

def import_any(path):
    ext = os.path.splitext(path)[1].lower()
    before = set(bpy.data.objects)
    if ext in ('.glb', '.gltf'):
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == '.obj':
        (bpy.ops.wm.obj_import if hasattr(bpy.ops.wm, 'obj_import') else bpy.ops.import_scene.obj)(filepath=path)
    elif ext == '.stl':
        (bpy.ops.wm.stl_import if hasattr(bpy.ops.wm, 'stl_import') else bpy.ops.import_mesh.stl)(filepath=path)
    elif ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=path)
    else:
        raise ValueError("Format tidak didukung: " + ext)
    return [o for o in bpy.data.objects if o not in before and o.type == 'MESH']

def clean(obj, merge_dist):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=merge_dist)
    loose = [v for v in bm.verts if not v.link_edges]
    bmesh.ops.delete(bm, geom=loose, context='VERTS')
    open_edges = [e for e in bm.edges if e.is_boundary]
    holes_before = len(open_edges)
    if open_edges:
        bmesh.ops.holes_fill(bm, edges=open_edges, sides=64)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    tris = len(bm.faces)
    bm.to_mesh(obj.data)
    bm.free()
    return holes_before, tris

def main(P):
    objs = import_any(P["FILEPATH"])
    if not objs:
        raise RuntimeError("Tidak ada mesh yang terimpor")
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = P["OBJ_NAME"]
    obj.parent = None
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    rx, ry, rz = [math.radians(a) for a in P["ROTATE_DEG"]]
    obj.rotation_euler = (rx, ry, rz)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    holes, tris = clean(obj, P["MERGE_DIST_MM"])
    if P["VOXEL_REMESH_MM"] > 0:
        obj.data.remesh_voxel_size = P["VOXEL_REMESH_MM"]
        bpy.ops.object.voxel_remesh()
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    width = obj.dimensions.x
    if width <= 0:
        raise RuntimeError("Lebar objek 0; periksa orientasi")
    s = P["TARGET_WIDTH_MM"] / width
    obj.scale = (s, s, s)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.context.view_layer.update()
    # taruh dasar di Z=0 dan tengah di XY=0
    bb = [obj.matrix_world @ v.co for v in obj.data.vertices]
    min_z = min(v.z for v in bb)
    cx = (min(v.x for v in bb) + max(v.x for v in bb)) / 2
    cy = (min(v.y for v in bb) + max(v.y for v in bb)) / 2
    obj.location = (-cx, -cy, -min_z)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    d = obj.dimensions
    info = dict(name=obj.name, faces=len(obj.data.polygons), holes_filled_edges=holes,
                size_mm=(round(d.x, 3), round(d.y, 3), round(d.z, 3)), scale_applied=round(s, 6))
    print("FIT_DONE", info)
    return info

main(PARAMS)
