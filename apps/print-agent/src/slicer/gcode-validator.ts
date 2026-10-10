export interface PrinterBounds {
  bedX: number;
  bedY: number;
  bedZ: number;
  maxNozzleC: number;
  maxBedC: number;
}

export interface GcodeValidationResult {
  valid: boolean;
  errors: string[];
  maxNozzleSeen: number;
  maxBedSeen: number;
  maxZSeen: number;
  lineCount: number;
}

export class GcodeValidator {
  /**
   * Validates G-code string against safety limits and printer geometry
   */
  static validate(gcodeContent: string, bounds: PrinterBounds): GcodeValidationResult {
    const errors: string[] = [];
    const lines = gcodeContent.split('\n');

    let maxNozzleSeen = 0;
    let maxBedSeen = 0;
    let maxZSeen = 0;
    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      if (!line || line.startsWith(';')) continue;

      // Strip comments
      const cleanLine = line.split(';')[0]?.trim() ?? '';
      const tokens = cleanLine.split(/\s+/);
      const cmd = tokens[0]?.toUpperCase();

      // Check banned command: e.g. M118 //action (triggering host commands)
      if (cleanLine.includes('//action:')) {
        errors.push(`Line ${i + 1}: Prohibited host action macro: "${cleanLine}"`);
      }

      // Check nozzle temperature: M104 S<temp> or M109 S<temp>
      if (cmd === 'M104' || cmd === 'M109') {
        for (const token of tokens.slice(1)) {
          if (token.startsWith('S') || token.startsWith('s')) {
            const temp = parseFloat(token.substring(1));
            if (!isNaN(temp)) {
              if (temp > maxNozzleSeen) maxNozzleSeen = temp;
              if (temp > bounds.maxNozzleC) {
                errors.push(
                  `Line ${i + 1}: Nozzle temperature ${temp}°C exceeds safety limit of ${bounds.maxNozzleC}°C`,
                );
              }
            }
          }
        }
      }

      // Check bed temperature: M140 S<temp> or M190 S<temp>
      if (cmd === 'M140' || cmd === 'M190') {
        for (const token of tokens.slice(1)) {
          if (token.startsWith('S') || token.startsWith('s')) {
            const temp = parseFloat(token.substring(1));
            if (!isNaN(temp)) {
              if (temp > maxBedSeen) maxBedSeen = temp;
              if (temp > bounds.maxBedC) {
                errors.push(
                  `Line ${i + 1}: Bed temperature ${temp}°C exceeds safety limit of ${bounds.maxBedC}°C`,
                );
              }
            }
          }
        }
      }

      // Check motion bounds: G0, G1
      if (cmd === 'G0' || cmd === 'G1') {
        for (const token of tokens.slice(1)) {
          const axis = token[0]?.toUpperCase();
          const val = parseFloat(token.substring(1));
          if (!isNaN(val)) {
            if (axis === 'X') {
              currentX = val;
              if (val < -5 || val > bounds.bedX + 5) {
                errors.push(`Line ${i + 1}: X position ${val}mm out of bed bounds (0..${bounds.bedX})`);
              }
            } else if (axis === 'Y') {
              currentY = val;
              if (val < -5 || val > bounds.bedY + 5) {
                errors.push(`Line ${i + 1}: Y position ${val}mm out of bed bounds (0..${bounds.bedY})`);
              }
            } else if (axis === 'Z') {
              currentZ = val;
              if (val > maxZSeen) maxZSeen = val;
              if (val < -1 || val > bounds.bedZ + 5) {
                errors.push(`Line ${i + 1}: Z position ${val}mm out of height bounds (0..${bounds.bedZ})`);
              }
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      maxNozzleSeen,
      maxBedSeen,
      maxZSeen,
      lineCount: lines.length,
    };
  }
}
