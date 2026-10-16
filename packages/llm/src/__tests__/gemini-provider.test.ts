import { describe, it, expect } from 'vitest';
import { GeminiProvider, generateMockDesignSpec } from '../providers/gemini';

describe('GeminiProvider & Mock Generator', () => {
  it('generates a valid themed spec with mock prompt (cyberpunk)', () => {
    const spec = generateMockDesignSpec({
      prompt: 'Cyberpunk neon keycap set with glowing accents',
      layout: {
        modelName: 'Keychron Q1 Pro',
        switchType: 'CHERRY_MX',
        keyCount: 82,
        keyGroups: ['ALPHAS', 'MODIFIERS', 'ESC', 'ENTER'],
      },
    });

    expect(spec.theme.name).toBe('Cyberpunk Neon Pulse');
    expect(spec.global.profile).toBe('CHERRY');
    expect(spec.global.stem).toBe('MX');
    expect(spec.overrides.length).toBeGreaterThan(0);
  });

  it('generates a valid themed spec with matcha botanical prompt', () => {
    const spec = generateMockDesignSpec({
      prompt: 'Matcha green tea pastel minimalist design',
      layout: {
        modelName: 'Zoom75',
        switchType: 'CHERRY_MX',
        keyCount: 82,
        keyGroups: ['ALPHAS', 'MODIFIERS'],
      },
    });

    expect(spec.theme.name).toBe('Matcha Botanical Garden');
    expect(spec.global.baseColor).toBe('#e8ecd7');
  });

  it('GeminiProvider falls back to mock generator when using dummy or unconfigured key', async () => {
    const provider = new GeminiProvider('your-gemini-api-key', 'gemini-2.5-flash');
    const spec = await provider.generateDesignSpec({
      prompt: 'Retro vintage beige keyboard style',
      layout: {
        modelName: 'Standard 60%',
        switchType: 'CHERRY_MX',
        keyCount: 61,
        keyGroups: ['ALPHAS', 'MODIFIERS'],
      },
    });

    expect(spec.theme.name).toBe('Vintage Atelier 1984');
    expect(spec.global.material).toBe('PETG');
  });
});
