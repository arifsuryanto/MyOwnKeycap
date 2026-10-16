"""03_keycap_base.py - Basis keycap MX parametrik: skirt berongga, atap, stem silang.
Hasil: objek 'KeycapBase' (dasar di Z=0, pusat di XY=0, depan = -Y). Semua dimensi mm (default awal, kalibrasi dengan test print)."""
import bpy, bmesh
from mathutils import Vector

PARAMS = dict(
    BOTTOM_W=18.0, BOTTOM_D=18.0,   # footprint bawah (1u)
    TOP_W=14.0, TOP_D=13.0,         # permukaan atas
    HEIGHT=9.5,                     # tinggi basis
    TOP_SHIFT_Y=1.0,                # geser atas ke belakang (+Y) agar miring ke depan
    WALL=1.5, ROOF=1.8,
    STEM_DIAMETER=5.5, STEM_BOTTOM_Z=0.5, CROSS_DEPTH=4.6,
    CROSS_LEN=4.0, CROSS_WIDTH=1.3, TOL=0.15,
    OBJ_NAME="KeycapBase",
)

def frustum(name, bw, bd, tw, td, z0, z1, shift_y=0.0):
    v = [(-bw/2, -bd/2, z0), (bw/2, -bd/2, z0), (bw/2, bd/2, z0), (-bw/2, bd/2, z0),
         (-tw/2, -td/2 + shift_y, z1), (tw/2, -td/2 + shift_y, z1),
         (tw/2, td/2 + shift_y, z1), (-tw/2, td/2 + shift_y, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(v, [], f)
    me.update()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob

def box(name, sx, sy, sz, cz):
    ob = frustum(name, sx, sy, sx, sy, cz - sz/2, cz + sz/2)
    return ob

def cylinder(name, r, z0, z1, seg=48):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=z1 - z0)
    bmesh.ops.translate(bm, vec=Vector((0, 0, (z0 + z1) / 2)), verts=bm.verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob

def boolean(target, other, op):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = target
    target.select_set(True)
    m = target.modifiers.new("bool", 'BOOLEAN')
    m.operation = op
    m.object = other
    m.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(other, do_unlink=True)

def main(P):
    h, w = P["HEIGHT"], P["WALL"]
    outer = frustum(P["OBJ_NAME"], P["BOTTOM_W"], P["BOTTOM_D"], P["TOP_W"], P["TOP_D"], 0.0, h, P["TOP_SHIFT_Y"])
    ceil_z = h - P["ROOF"]
    # rongga: frustum dalam, dari sedikit di bawah Z=0 sampai atap
    k = (ceil_z + 0.2) / h
    inner_top_w = (P["BOTTOM_W"] - 2*w) + ((P["TOP_W"] - 2*w) - (P["BOTTOM_W"] - 2*w)) * (ceil_z / h)
    inner_top_d = (P["BOTTOM_D"] - 2*w) + ((P["TOP_D"] - 2*w) - (P["BOTTOM_D"] - 2*w)) * (ceil_z / h)
    cavity = frustum("cavity", P["BOTTOM_W"] - 2*w, P["BOTTOM_D"] - 2*w, inner_top_w, inner_top_d,
                     -0.2, ceil_z, P["TOP_SHIFT_Y"] * (ceil_z / h))
    boolean(outer, cavity, 'DIFFERENCE')
    # stem
    stem = cylinder("stem", P["STEM_DIAMETER"] / 2, P["STEM_BOTTOM_Z"], ceil_z + 0.4)
    boolean(outer, stem, 'UNION')
    cl = P["CROSS_LEN"] + P["TOL"]
    cw = P["CROSS_WIDTH"] + P["TOL"]
    z0 = P["STEM_BOTTOM_Z"] - 0.1
    cz = z0 + (P["CROSS_DEPTH"] + 0.1) / 2
    for i, (sx, sy) in enumerate(((cl, cw), (cw, cl))):
        cut = box("cross%d" % i, sx, sy, P["CROSS_DEPTH"] + 0.1, cz)
        boolean(outer, cut, 'DIFFERENCE')
    bpy.context.view_layer.objects.active = outer
    # periksa manifold
    bm = bmesh.new()
    bm.from_mesh(outer.data)
    nm = sum(1 for e in bm.edges if not e.is_manifold)
    vol = bm.calc_volume()
    bm.free()
    d = outer.dimensions
    info = dict(name=outer.name, size_mm=(round(d.x, 2), round(d.y, 2), round(d.z, 2)),
                non_manifold_edges=nm, volume_mm3=round(vol, 1))
    print("BASE_DONE", info)
    return info

main(PARAMS)
