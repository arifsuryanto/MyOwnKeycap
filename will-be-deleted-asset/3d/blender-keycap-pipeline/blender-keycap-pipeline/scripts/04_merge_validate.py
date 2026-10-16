"""04_merge_validate.py - Tempelkan 'CatHead' ke 'KeycapBase', validasi cetak, ekspor STL.
Prasyarat: objek CatHead (dasar Z=0, tengah XY=0) dan KeycapBase (Z=0..HEIGHT) sudah ada.
Jika validasi gagal, EXPORT dilewati dan laporan menjelaskan alasannya."""
import bpy, bmesh, random, os
from mathutils import Vector
from mathutils.bvhtree import BVHTree

PARAMS = dict(
    HEAD_NAME="CatHead", BASE_NAME="KeycapBase", FINAL_NAME="KeycapFinal",
    EMBED_MM=1.2,            # kepala tertanam ke atap basis
    HEAD_OFFSET_XY=(0.0, 0.0),  # geser kepala (X, Y) mm; +Y = ke belakang
    HEAD_YAW_DEG=0.0,
    MAX_TOTAL_HEIGHT=22.0,
    MIN_WALL_MM=1.0,         # resin 1.0; FDM 1.5
    SAMPLES=4000,
    EXPORT_PATH=r"C:\keycap\keycap_final.stl",   # kosongkan "" untuk melewati ekspor
    KEEP_SOURCES=True,       # simpan salinan HEAD/BASE yang disembunyikan
)

def bm_of(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.transform(obj.matrix_world)
    return bm

def wall_stats(obj, samples, seed=1):
    random.seed(seed)
    bm = bm_of(obj)
    bm.faces.ensure_lookup_table()
    bvh = BVHTree.FromBMesh(bm)
    vals = []
    faces = list(bm.faces)
    for _ in range(samples):
        f = random.choice(faces)
        p = f.calc_center_median()
        n = f.normal.normalized()
        hit = bvh.ray_cast(p - n * 0.01, -n, 50.0)
        if hit and hit[0] is not None:
            vals.append(hit[3] + 0.01)
    bm.free()
    if not vals:
        return None
    vals.sort()
    return dict(min=round(vals[0], 3), p05=round(vals[int(len(vals) * 0.05)], 3), median=round(vals[len(vals) // 2], 3))

def select_only(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

def export_stl(obj, path):
    select_only(obj)
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    if hasattr(bpy.ops.wm, "stl_export"):
        bpy.ops.wm.stl_export(filepath=path, export_selected_objects=True)
    else:
        bpy.ops.export_mesh.stl(filepath=path, use_selection=True)

def main(P):
    head = bpy.data.objects[P["HEAD_NAME"]]
    base = bpy.data.objects[P["BASE_NAME"]]
    roof_z = max((base.matrix_world @ v.co).z for v in base.data.vertices)
    head.rotation_euler[2] += P["HEAD_YAW_DEG"] * 3.14159265 / 180.0
    head.location = Vector((P["HEAD_OFFSET_XY"][0], P["HEAD_OFFSET_XY"][1], roof_z - P["EMBED_MM"]))
    bpy.context.view_layer.update()
    if P["KEEP_SOURCES"]:
        for src in (head, base):
            c = src.copy(); c.data = src.data.copy(); c.name = src.name + "_src"
            bpy.context.scene.collection.objects.link(c); c.hide_set(True); c.hide_render = True
    select_only(base)
    head.select_set(True)
    bpy.context.view_layer.objects.active = base
    m = base.modifiers.new("union", 'BOOLEAN')
    m.operation = 'UNION'; m.object = head; m.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(head, do_unlink=True)
    base.name = P["FINAL_NAME"]
    bpy.context.view_layer.update()
    final = base
    # validasi
    bm = bm_of(final)
    non_manifold = sum(1 for e in bm.edges if not e.is_manifold)
    volume = bm.calc_volume()
    bm.free()
    zs = [(final.matrix_world @ v.co).z for v in final.data.vertices]
    height = max(zs) - min(zs)
    walls = wall_stats(final, P["SAMPLES"])
    problems = []
    if non_manifold:
        problems.append("non-manifold edges: %d (jalankan voxel remesh 0.04 mm atau perbaiki manual)" % non_manifold)
    if height > P["MAX_TOTAL_HEIGHT"]:
        problems.append("tinggi %.2f mm > %.1f mm" % (height, P["MAX_TOTAL_HEIGHT"]))
    if walls and walls["p05"] < P["MIN_WALL_MM"]:
        problems.append("dinding p05 %.2f mm < %.2f mm (area bulu halus yang sengaja tipis boleh diabaikan setelah ditinjau)" % (walls["p05"], P["MIN_WALL_MM"]))
    report = dict(name=final.name, volume_mm3=round(volume, 1), height_mm=round(height, 2),
                  non_manifold_edges=non_manifold, wall_mm=walls, ok=not problems, problems=problems)
    if report["ok"] and P["EXPORT_PATH"]:
        export_stl(final, P["EXPORT_PATH"])
        report["exported"] = P["EXPORT_PATH"]
    print("VALIDATE_DONE", report)
    return report

main(PARAMS)
