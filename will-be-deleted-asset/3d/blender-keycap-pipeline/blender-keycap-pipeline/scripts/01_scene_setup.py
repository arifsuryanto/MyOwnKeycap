"""01_scene_setup.py - Siapkan scene Blender untuk pipeline keycap (1 BU = 1 mm, Z up, depan = -Y).
Jalankan lewat Blender MCP (kirim isi file ini). Hapus SEMUA objek di scene saat CLEAR_SCENE=True."""
import bpy

PARAMS = dict(
    CLEAR_SCENE=True,
    SAMPLES=128,          # pratinjau lewat MCP; final 256-512 via blender -b
    RES=(2048, 2048),
    WORLD_COLOR=(0.012, 0.012, 0.014, 1.0),
)

def set_input(node, names, value):
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return True
    return False

def main(P):
    scene = bpy.context.scene
    if P["CLEAR_SCENE"]:
        if bpy.context.object and bpy.context.object.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
    u = scene.unit_settings
    u.system = 'METRIC'
    u.scale_length = 0.001
    u.length_unit = 'MILLIMETERS'
    scene.render.engine = 'CYCLES'
    cy = scene.cycles
    cy.samples = P["SAMPLES"]
    cy.use_denoising = True
    try:
        cy.device = 'GPU'
    except Exception:
        cy.device = 'CPU'
    scene.render.resolution_x, scene.render.resolution_y = P["RES"]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    for vt in ('AgX', 'Filmic', 'Standard'):
        try:
            scene.view_settings.view_transform = vt
            break
        except TypeError:
            continue
    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = P["WORLD_COLOR"]
        bg.inputs[1].default_value = 1.0
    info = dict(blender=bpy.app.version_string, engine=scene.render.engine,
                unit_scale=u.scale_length, device=cy.device, samples=cy.samples)
    print("SCENE_READY", info)
    return info

main(PARAMS)
