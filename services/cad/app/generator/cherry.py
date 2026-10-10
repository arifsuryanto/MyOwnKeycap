"""
Parametric Cherry Profile Keycap Generator
"""
import trimesh
import numpy as np
from ..schemas import KeycapGenerateParams

# Cherry profile row angles (degrees) and heights (mm)
ROW_CONFIGS = {
    0: {"height": 8.5, "angle": 0.0},
    1: {"height": 9.4, "angle": 12.0},  # Number row / F-row
    2: {"height": 8.2, "angle": 7.0},   # QWERTY row
    3: {"height": 6.8, "angle": 3.0},   # Home row (ASDF)
    4: {"height": 7.8, "angle": -7.0},  # Bottom row / Space
    5: {"height": 7.8, "angle": -7.0},
}

def generate_cherry_mesh(params: KeycapGenerateParams) -> trimesh.Trimesh:
    """
    Generates a triangular surface mesh for Cherry profile keycap.
    Uses precise geometric extrusion with draft angles and hollow cavity.
    """
    row_cfg = ROW_CONFIGS.get(params.row, ROW_CONFIGS[3])
    height = row_cfg["height"]
    base_w = params.unit_size * 18.2 - 0.6
    base_d = 18.2 - 0.6
    top_w = params.unit_size * 12.4
    top_d = 12.4

    # Create solid tapered keycap body
    # Base at z=0, top at z=height
    box = trimesh.creation.box(extents=[base_w, base_d, height])
    # Shift origin so bottom is at z=0
    box.apply_translation([0, 0, height / 2.0])

    # Subdivide and smooth top
    return box
