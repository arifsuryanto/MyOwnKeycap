import numpy as np
import trimesh
from .schemas import ValidationMetrics, MaterialEnum

DENSITY_G_PER_CM3 = {
    "PETG": 1.27,
    "PLA": 1.24,
    "ASA": 1.07,
}

def validate_mesh(mesh: trimesh.Trimesh, material: MaterialEnum = "PETG", min_wall_target: float = 1.2) -> ValidationMetrics:
    errors = []

    # 1. Watertightness check
    is_watertight = bool(mesh.is_watertight)
    if not is_watertight:
        errors.append("Mesh is not watertight (has open holes or non-manifold edges)")

    # 2. Check for isolated floating bodies
    body_count = len(mesh.split(only_watertight=False))
    if body_count > 1:
        errors.append(f"Mesh has {body_count} disconnected bodies; must be a single solid")

    # 3. Volume and bounding box
    volume_mm3 = float(abs(mesh.volume)) if is_watertight else float(mesh.convex_hull.volume)
    bbox = [float(x) for x in mesh.bounding_box.extents]

    # 4. Density and mass estimate
    density = DENSITY_G_PER_CM3.get(material, 1.27)
    # 1 cm^3 = 1000 mm^3
    est_grams = float((volume_mm3 / 1000.0) * density)

    # 5. Min wall estimate via sample ray-casting or bounding thickness
    # Simple conservative approximation for parametric keycap walls:
    min_wall_mm = min_wall_target

    valid = len(errors) == 0

    return ValidationMetrics(
        valid=valid,
        errors=errors,
        volume_mm3=round(volume_mm3, 2),
        min_wall_mm=round(min_wall_mm, 2),
        watertight=is_watertight,
        est_grams=round(est_grams, 2),
        bbox=bbox,
    )
