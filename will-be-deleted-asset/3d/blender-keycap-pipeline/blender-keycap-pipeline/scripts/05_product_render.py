"""05_product_render.py - Render produk 6 sudut (FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM) seperti foto referensi.
Pencahayaan: key + fill + rim (area light), latar gelap, lantai mengilap. Skala mm: energi lampu dihitung ~ jarak^2.
Untuk final jalankan via `blender -b file.blend -P skrip` dengan SAMPLES lebih tinggi."""
import bpy, math, os
from mathutils import Vector

PARAMS = dict(
    TARGET_NAME="KeycapFinal",
    OUT_DIR=r"C:\keycap\renders",
    SAMPLES=128, RES=(1600, 1600),
    LENS_MM=85.0, FSTOP=11.0, FRAME_MARGIN=1.25,
    VIEWS=["FRONT", "BACK", "LEFT", "RIGHT", "TOP", "BOTTOM"],
    CLAY_COLOR=(0.78, 0.60, 0.42, 1.0),
    ASSIGN_MATERIAL=True,           # False jika mesh sudah punya material/tekstur dari generator
    KEY_POWER_BASE=450.0,           # watt pada jarak 3 unit; skala dengan (jarak/3)^2
    FLOOR_COLOR=(0.015, 0.015, 0.017, 1.0),
)

DIRS = {  # arah dari objek ke kamera; depan keycap = -Y
    "FRONT": (0, -1, 0.12), "BACK": (0, 1, 0.12), "LEFT": (-1, 0, 0.12), "RIGHT": (1, 0, 0.12),
    "TOP": (0, -0.001, 1), "BOTTOM": (0, -0.001, -1),
}

def set_input(node, names, value):
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return True
    return False

def clay_material(color):
    m = bpy.data.materials.new("ClayPolymer")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    set_input(b, ["Base Color"], color)
    set_input(b, ["Roughness"], 0.48)
    set_input(b, ["Subsurface Weight", "Subsurface"], 0.12)
    set_input(b, ["Subsurface Radius"], (0.9, 0.55, 0.35))
    set_input(b, ["Coat Weight", "Clearcoat"], 0.15)
    set_input(b, ["Specular IOR Level", "Specular"], 0.4)
    return m

def bounds(obj):
    pts = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx

def add_area(name, loc, target, size, power, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy = power; ld.size = size; ld.color = color
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    direction = Vector(target) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    return ob

def main(P):
    scene = bpy.context.scene
    obj = bpy.data.objects[P["TARGET_NAME"]]
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = P["SAMPLES"]; scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = P["RES"]
    if P["ASSIGN_MATERIAL"]:
        obj.data.materials.clear()
        obj.data.materials.append(clay_material(P["CLAY_COLOR"]))
    for poly in obj.data.polygons:
        poly.use_smooth = True
    mn, mx = bounds(obj)
    center = (mn + mx) / 2
    size = max((mx - mn).x, (mx - mn).y, (mx - mn).z)
    # lantai mengilap
    bpy.ops.mesh.primitive_plane_add(size=size * 12, location=(0, 0, mn.z - 0.02))
    floor = bpy.context.object; floor.name = "Floor"
    fm = bpy.data.materials.new("FloorMat"); fm.use_nodes = True
    fb = fm.node_tree.nodes["Principled BSDF"]
    set_input(fb, ["Base Color"], P["FLOOR_COLOR"]); set_input(fb, ["Roughness"], 0.25)
    floor.data.materials.append(fm)
    # kamera
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = P["LENS_MM"]; cam_data.sensor_width = 36.0
    cam_data.clip_start = 0.5; cam_data.clip_end = 5000.0
    cam_data.dof.use_dof = True; cam_data.dof.aperture_fstop = P["FSTOP"]
    cam = bpy.data.objects.new("Cam_Product", cam_data)
    scene.collection.objects.link(cam); scene.camera = cam
    focus = bpy.data.objects.new("FocusTarget", None)
    scene.collection.objects.link(focus); focus.location = center
    cam_data.dof.focus_object = focus
    fov = 2 * math.atan(18.0 / P["LENS_MM"])
    dist = size / (2 * math.tan(fov / 2)) * P["FRAME_MARGIN"]
    # lampu (di sekitar objek, diskalakan terhadap jarak)
    def power(d): return P["KEY_POWER_BASE"] * (d / 3.0) ** 2
    dk = dist * 0.9
    key = add_area("Light_Key", center + Vector((-0.7, -0.8, 0.9)).normalized() * dk, center, size * 2.2, power(dk), (1.0, 0.96, 0.9))
    fill = add_area("Light_Fill", center + Vector((0.9, -0.5, 0.35)).normalized() * dk, center, size * 3.0, power(dk) * 0.25, (0.9, 0.95, 1.0))
    rim = add_area("Light_Rim", center + Vector((0.2, 0.9, 0.7)).normalized() * dk, center, size * 1.5, power(dk) * 0.6, (1.0, 1.0, 1.0))
    os.makedirs(P["OUT_DIR"], exist_ok=True)
    out = []
    for v in P["VIEWS"]:
        d = Vector(DIRS[v]).normalized()
        cam.location = center + d * dist
        cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
        floor.hide_render = v in ("TOP", "BOTTOM")
        for lt in (key, fill, rim):
            lt.hide_render = False
        scene.render.filepath = os.path.join(P["OUT_DIR"], "keycap_%s.png" % v)
        bpy.ops.render.render(write_still=True)
        out.append(scene.render.filepath)
    floor.hide_render = False
    print("RENDER_DONE", out)
    return out

main(PARAMS)
