"""
Parametric OEM Profile Keycap Generator
"""
import trimesh
from ..schemas import KeycapGenerateParams

# OEM profile row angles (degrees) and heights (mm) - standard taller profile
ROW_CONFIGS_OEM = {
    0: {"height": 10.5, "angle": 0.0},
    1: {"height": 11.5, "angle": 14.0},
    2: {"height": 10.2, "angle": 8.0},
    3: {"height": 8.8, "angle": 4.0},
    4: {"height": 9.5, "angle": -8.0},
    5: {"height": 9.5, "angle": -8.0},
}

def generate_oem_mesh(params: KeycapGenerateParams) -> trimesh.Trimesh:
    """
    Generates a triangular surface mesh for OEM profile keycap.
    """
    row_cfg = ROW_CONFIGS_OEM.get(params.row, ROW_CONFIGS_OEM[3])
    height = row_cfg["height"]
    base_w = params.unit_size * 18.2 - 0.5
    base_d = 18.2 - 0.5

    box = trimesh.creation.box(extents=[base_w, base_d, height])
    box.apply_translation([0, 0, height / 2.0])

    return box
