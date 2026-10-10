import type { PrinterAdapter, PrinterTelemetry } from './adapter';

export class MoonrakerAdapter implements PrinterAdapter {
  readonly kind = 'moonraker' as const;

  constructor(
    private moonrakerUrl: string = 'http://localhost:7125',
    private apiKey?: string,
  ) {}

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['X-Api-Key'] = this.apiKey;
    return h;
  }

  async connect(): Promise<void> {
    try {
      const res = await fetch(`${this.moonrakerUrl}/printer/info`, { headers: this.headers });
      if (!res.ok) throw new Error(`Moonraker connect returned ${res.status}`);
    } catch (err: any) {
      console.warn(`Moonraker connect warning: ${err.message}`);
    }
  }

  async disconnect(): Promise<void> {}

  async getTelemetry(): Promise<PrinterTelemetry> {
    try {
      const res = await fetch(
        `${this.moonrakerUrl}/printer/objects/query?extruder&heater_bed&print_stats`,
        { headers: this.headers },
      );
      if (!res.ok) throw new Error(`Failed to query objects: ${res.status}`);
      const data: any = await res.json();
      const status = data.result?.status || {};

      const extruder = status.extruder || {};
      const bed = status.heater_bed || {};
      const stats = status.print_stats || {};

      let state: PrinterTelemetry['state'] = 'idle';
      if (stats.state === 'printing') state = 'printing';
      else if (stats.state === 'paused') state = 'paused';
      else if (stats.state === 'error') state = 'error';

      return {
        state,
        nozzleTemp: extruder.temperature || 0,
        nozzleTarget: extruder.target || 0,
        bedTemp: bed.temperature || 0,
        bedTarget: bed.target || 0,
        progressPercent: Math.round((stats.progress || 0) * 100),
      };
    } catch {
      return {
        state: 'idle',
        nozzleTemp: 0,
        nozzleTarget: 0,
        bedTemp: 0,
        bedTarget: 0,
        progressPercent: 0,
      };
    }
  }

  async startPrint(jobId: string, gcodeContent: string): Promise<void> {
    // 1. Upload G-code file to Moonraker
    const filename = `job_${jobId}.gcode`;
    const form = new FormData();
    const blob = new Blob([gcodeContent], { type: 'text/plain' });
    form.append('file', blob, filename);

    const uploadRes = await fetch(`${this.moonrakerUrl}/server/files/upload`, {
      method: 'POST',
      headers: this.apiKey ? { 'X-Api-Key': this.apiKey } : {},
      body: form,
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload G-code to Moonraker: ${uploadRes.statusText}`);
    }

    // 2. Instruct Klipper to print the file
    const startRes = await fetch(`${this.moonrakerUrl}/printer/print/start`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ filename }),
    });

    if (!startRes.ok) {
      throw new Error(`Failed to start print on Moonraker: ${startRes.statusText}`);
    }
  }

  async pause(): Promise<void> {
    await fetch(`${this.moonrakerUrl}/printer/print/pause`, {
      method: 'POST',
      headers: this.headers,
    });
  }

  async resume(): Promise<void> {
    await fetch(`${this.moonrakerUrl}/printer/print/resume`, {
      method: 'POST',
      headers: this.headers,
    });
  }

  async cancel(): Promise<void> {
    await fetch(`${this.moonrakerUrl}/printer/print/cancel`, {
      method: 'POST',
      headers: this.headers,
    });
  }
}
