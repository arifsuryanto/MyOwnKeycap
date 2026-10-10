import type { KeycapDesignSpec } from '@keycap/shared';

export interface LayoutSummary {
  modelName: string;
  switchType: string;
  keyCount: number;
  keyGroups: string[];
}

export interface DesignOptions {
  profile?: 'CHERRY' | 'OEM' | undefined;
  material?: 'PETG' | 'PLA' | 'ASA' | undefined;
  finish?: 'RAW' | 'SANDED' | 'PAINTED' | undefined;
  baseColor?: string | undefined;
  legendColor?: string | undefined;
}

export interface GenerateDesignInput {
  prompt: string;
  layout: LayoutSummary;
  options?: DesignOptions | undefined;
}

export interface LlmClient {
  generateDesignSpec(input: GenerateDesignInput): Promise<KeycapDesignSpec>;
}
