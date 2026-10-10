import { describe, it, expect } from 'vitest';
import { GcodeValidator, type PrinterBounds } from '../slicer/gcode-validator';

const bounds: PrinterBounds = {
  bedX: 250,
  bedY: 210,
  bedZ: 210,
  maxNozzleC: 265,
  maxBedC: 90,
};

describe('G-code Safety Validator', () => {
  it('accepts safe standard G-code', () => {
    const safeGcode = `
      ; Standard keycap print
      M140 S65 ; bed temp 65C
      M104 S240 ; nozzle temp 240C
      G28 ; home all
      G1 Z0.2 F1200
      G1 X120 Y100 E5 F1500
      G1 X130 Y100 E8
      M104 S0
      M140 S0
    `;

    const res = GcodeValidator.validate(safeGcode, bounds);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.maxNozzleSeen).toBe(240);
    expect(res.maxBedSeen).toBe(65);
  });

  it('rejects excessive nozzle temperature exceeding safety limit', () => {
    const dangerousGcode = `
      M104 S310 ; way too hot for PETG/PLA!
      G28
    `;

    const res = GcodeValidator.validate(dangerousGcode, bounds);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('exceeds safety limit of 265°C');
  });

  it('rejects excessive bed temperature', () => {
    const dangerousGcode = `
      M190 S115 ; bed limit is 90C
      G28
    `;

    const res = GcodeValidator.validate(dangerousGcode, bounds);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('exceeds safety limit of 90°C');
  });

  it('rejects X/Y moves exceeding printer bed boundaries', () => {
    const oobGcode = `
      M104 S230
      G28
      G1 X350 Y100 ; bedX is 250!
    `;

    const res = GcodeValidator.validate(oobGcode, bounds);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('X position 350mm out of bed bounds');
  });

  it('rejects host action macros', () => {
    const maliciousGcode = `
      G28
      //action:cancel arbitrary host command
    `;

    const res = GcodeValidator.validate(maliciousGcode, bounds);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('Prohibited host action macro');
  });
});
