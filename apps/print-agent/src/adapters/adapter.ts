export interface PrinterTelemetry {
  state: 'idle' | 'heating' | 'printing' | 'paused' | 'error';
  nozzleTemp: number;
  nozzleTarget: number;
  bedTemp: number;
  bedTarget: number;
  progressPercent: number;
  currentLayer?: number;
  totalLayers?: number;
}

export interface PrinterAdapter {
  readonly kind: 'simulator' | 'moonraker';
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getTelemetry(): Promise<PrinterTelemetry>;
  startPrint(jobId: string, gcodeContent: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
}
