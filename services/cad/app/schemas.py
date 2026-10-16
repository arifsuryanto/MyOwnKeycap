from typing import Optional, List, Literal
from pydantic import BaseModel, Field

ProfileEnum = Literal["CHERRY", "OEM"]
StemEnum = Literal["MX"]
MaterialEnum = Literal["PETG", "PLA", "ASA"]
FinishEnum = Literal["RAW", "SANDED", "PAINTED"]
FontEnum = Literal["inter-bold", "jetbrains-mono", "space-grotesk", "noto-sans-jp"]
LegendModeEnum = Literal["ENGRAVE", "EMBOSS"]
LegendPositionEnum = Literal["CENTER", "TOP_LEFT", "FRONT"]

class LegendParams(BaseModel):
    text: str = Field(min_length=1, max_length=8)
    font: FontEnum = "inter-bold"
    size_mm: float = Field(default=5.0, ge=2.0, le=9.0)
    depth_mm: float = Field(default=0.4, ge=0.2, le=0.8)
    mode: LegendModeEnum = "ENGRAVE"
    position: LegendPositionEnum = "CENTER"

class ImageReliefParams(BaseModel):
    image_url: str
    name: Optional[str] = None
    depth_mm: float = Field(default=0.4, ge=0.2, le=0.8)
    mode: Literal["EMBOSS", "ENGRAVE"] = "EMBOSS"
    invert: bool = False
    scale: float = Field(default=0.75, ge=0.1, le=1.0)

class KeycapGenerateParams(BaseModel):
    key_id: str
    unit_size: float = Field(default=1.0, ge=1.0, le=7.0)
    row: int = Field(default=3, ge=0, le=5) # R1-R4/R5 sculpt
    profile: ProfileEnum = "CHERRY"
    stem: StemEnum = "MX"
    material: MaterialEnum = "PETG"
    base_color: str = Field(default="#1a1a1a", pattern=r"^#[0-9a-fA-F]{6}$")
    legend_color: str = Field(default="#f4f4f5", pattern=r"^#[0-9a-fA-F]{6}$")
    stem_tolerance_mm: float = Field(default=0.15, ge=0.05, le=0.30)
    wall_mm: float = Field(default=1.5, ge=1.2, le=2.4)
    legend: Optional[LegendParams] = None
    relief: Optional[ImageReliefParams] = None
    spec_hash: str

class ValidationMetrics(BaseModel):
    valid: bool
    errors: List[str]
    volume_mm3: float
    min_wall_mm: float
    watertight: bool
    est_grams: float
    bbox: List[float]

class KeycapResponse(BaseModel):
    key_id: str
    spec_hash: str
    stl_url: Optional[str] = None
    threemf_url: Optional[str] = None
    glb_url: Optional[str] = None
    metrics: ValidationMetrics

