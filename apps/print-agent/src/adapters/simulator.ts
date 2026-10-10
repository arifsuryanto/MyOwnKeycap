import type { PrinterAdapter, PrinterTelemetry } from './adapter';

export class SimulatorAdapter implements PrinterAdapter {
  readonly kind = 'simulator' as const;

  private state: 'idle' | 'heating' | 'printing' | 'paused' | 'error' = 'idle';
  private nozzleTemp = 24.0;
  private nozzleTarget = 0.0;
  private bedTemp = 25.0;
  private bedTarget = 0.0;
  private progressPercent = 0.0;
  private currentLayer = 0;
  private totalLayers = 45;
  private simTimer: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    this.state = 'idle';
    this.nozzleTemp = 24.0;
    this.bedTemp = 25.0;
  }

  async disconnect(): Promise<void> {
    if (this.simTimer) clearInterval(this.simTimer);
    this.state = 'idle';
  }

  async getTelemetry(): Promise<PrinterTelemetry> {
    return {
      state: this.state,
      nozzleTemp: Math.round(this.nozzleTemp * 10) / 10,
      nozzleTarget: this.nozzleTarget,
      bedTemp: Math.round(this.bedTemp * 10) / 10,
      bedTarget: this.bedTarget,
      progressPercent: Math.round(this.progressPercent * 10) / 10,
      currentLayer: this.currentLayer,
      totalLayers: this.totalLayers,
    };
  }

  async startPrint(_jobId: string, _gcodeContent: string): Promise<void> {
    if (this.simTimer) clearInterval(this.simTimer);

    this.state = 'heating';
    this.nozzleTarget = 240.0;
    this.bedTarget = 70.0;
    this.progressPercent = 0.0;
    this.currentLayer = 0;

    // Simulation loop updating every 500ms
    this.simTimer = setInterval(() => {
      if (this.state === 'heating') {
        // Warm up bed and nozzle
        if (this.bedTemp < this.bedTarget) this.bedTemp += 4.5;
        if (this.nozzleTemp < this.nozzleTarget) this.nozzleTemp += 9.0;

        if (this.bedTemp >= this.bedTarget && this.nozzleTemp >= this.nozzleTarget) {
          this.state = 'printing';
        }
      } else if (this.state === 'printing') {
        // Advance layer and progress
        this.progressPercent += 2.5;
        this.currentLayer = Math.min(
          this.totalLayers,
          Math.floor((this.progressPercent / 100) * this.totalLayers),
        );

        if (this.progressPercent >= 100.0) {
          this.progressPercent = 100.0;
          this.state = 'idle';
          this.nozzleTarget = 0;
          this.bedTarget = 0;
          if (this.simTimer) clearInterval(this.simTimer);
        }
      }
    }, 500);
  }

  async pause(): Promise<void> {
    if (this.state === 'printing') this.state = 'paused';
  }

  async resume(): Promise<void> {
    if (this.state === 'paused') this.state = 'printing';
  }

  async cancel(): Promise<void> {
    if (this.simTimer) clearInterval(this.simTimer);
    this.state = 'idle';
    this.nozzleTarget = 0;
    this.bedTarget = 0;
    this.progressPercent = 0;
  }
}
