function clampNumber(value: number, min: number, max: number, defaultValue: number): number {
  if (typeof value !== 'number' || isNaN(value)) return defaultValue;
  return Math.min(Math.max(value, min), max);
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

function sanitizeHex(color: string | undefined, defaultColor: string): string {
  if (!color || typeof color !== 'string') return defaultColor;
  const trimmed = color.trim();
  if (HEX_COLOR_REGEX.test(trimmed)) return trimmed.toLowerCase();
  // Attempt to fix 3-digit hex
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return defaultColor;
}

export function clampDesignSpec(spec: any): any {
  if (!spec || typeof spec !== 'object') return spec;

  const cloned = JSON.parse(JSON.stringify(spec));

  // Global settings clamping
  if (cloned.global) {
    cloned.global.stemToleranceMm = clampNumber(
      cloned.global.stemToleranceMm,
      0.05,
      0.3,
      0.15,
    );
    cloned.global.wallMm = clampNumber(cloned.global.wallMm, 1.2, 2.4, 1.5);
    cloned.global.baseColor = sanitizeHex(cloned.global.baseColor, '#1a1a1a');
    cloned.global.legendColor = sanitizeHex(cloned.global.legendColor, '#f4f4f5');

    // Allowed enums validation / fallback
    if (!['CHERRY', 'OEM'].includes(cloned.global.profile)) {
      cloned.global.profile = 'CHERRY';
    }
    if (cloned.global.stem !== 'MX') {
      cloned.global.stem = 'MX';
    }
    if (!['PETG', 'PLA', 'ASA'].includes(cloned.global.material)) {
      cloned.global.material = 'PETG';
    }
    if (!['RAW', 'SANDED', 'PAINTED'].includes(cloned.global.finish)) {
      cloned.global.finish = 'RAW';
    }
    if (
      !['inter-bold', 'jetbrains-mono', 'space-grotesk', 'noto-sans-jp'].includes(
        cloned.global.font,
      )
    ) {
      cloned.global.font = 'inter-bold';
    }
  }

  // Overrides clamping
  if (Array.isArray(cloned.overrides)) {
    cloned.overrides = cloned.overrides.slice(0, 60).map((ov: any) => {
      const sanitizedOv: any = { ...ov };
      if (ov.baseColor) {
        sanitizedOv.baseColor = sanitizeHex(ov.baseColor, cloned.global?.baseColor ?? '#1a1a1a');
      }
      if (ov.legendColor) {
        sanitizedOv.legendColor = sanitizeHex(
          ov.legendColor,
          cloned.global?.legendColor ?? '#f4f4f5',
        );
      }
      if (ov.legend) {
        sanitizedOv.legend = {
          ...ov.legend,
          sizeMm: clampNumber(ov.legend.sizeMm, 2.0, 9.0, 5.0),
          depthMm: clampNumber(ov.legend.depthMm, 0.2, 0.8, 0.4),
          mode: ['ENGRAVE', 'EMBOSS'].includes(ov.legend.mode) ? ov.legend.mode : 'ENGRAVE',
          position: ['CENTER', 'TOP_LEFT', 'FRONT'].includes(ov.legend.position)
            ? ov.legend.position
            : 'CENTER',
          font: ['inter-bold', 'jetbrains-mono', 'space-grotesk', 'noto-sans-jp'].includes(
            ov.legend.font,
          )
            ? ov.legend.font
            : cloned.global?.font ?? 'inter-bold',
        };
      }
      return sanitizedOv;
    });
  }

  return cloned;
}
