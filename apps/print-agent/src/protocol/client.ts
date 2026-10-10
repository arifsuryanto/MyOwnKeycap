import WebSocket from 'ws';
import { AgentMessage, ServerMessage } from '@keycap/shared';
import type { PrinterAdapter } from '../adapters/adapter';

export interface AgentClientConfig {
  serverUrl: string;
  agentId: string;
  agentToken: string;
  printer: PrinterAdapter;
}

export class AgentWsClient {
  private ws: WebSocket | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private currentJobId: string | null = null;
  private isRunning = false;

  constructor(private config: AgentClientConfig) {}

  async start(): Promise<void> {
    this.isRunning = true;
    await this.config.printer.connect();
    this.connect();
  }

  stop(): void {
    this.isRunning = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.ws) this.ws.close();
  }

  private connect(): void {
    if (!this.isRunning) return;

    const wsUrl = `${this.config.serverUrl.replace(/^http/, 'ws')}/api/agent/ws?agentId=${encodeURIComponent(this.config.agentId)}&token=${encodeURIComponent(this.config.agentToken)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.sendHello();
        this.startHeartbeat();
        this.startTelemetryPolling();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('close', () => {
        this.cleanup();
        if (this.isRunning) {
          // Reconnect with backoff
          setTimeout(() => this.connect(), 5000);
        }
      });

      this.ws.on('error', (err) => {
        console.warn(`[Agent WS] Connection error: ${err.message}`);
      });
    } catch (err: any) {
      console.warn(`[Agent WS] Failed to initialize WebSocket: ${err.message}`);
      if (this.isRunning) setTimeout(() => this.connect(), 5000);
    }
  }

  private sendHello(): void {
    const helloMsg: AgentMessage = {
      type: 'hello',
      agentId: this.config.agentId,
      version: '1.0.0',
      capabilities: ['gcode-print', 'telemetry', 'simulator'],
      printers: [
        {
          id: 'printer-sim-1',
          name: 'Voron 2.4 (Simulator)',
          adapter: this.config.printer.kind,
          bedX: 300,
          bedY: 300,
          bedZ: 300,
        },
      ],
    };

    this.send(helloMsg);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'heartbeat', timestamp: Date.now() });
    }, 15000);
  }

  private startTelemetryPolling(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      if (!this.currentJobId) return;

      const telemetry = await this.config.printer.getTelemetry();
      const progressMsg: AgentMessage = {
        type: 'job.progress',
        jobId: this.currentJobId,
        state: telemetry.state === 'printing' ? 'printing' : 'awaiting_operator',
        percent: telemetry.progressPercent,
        temps: {
          nozzle: telemetry.nozzleTemp,
          bed: telemetry.bedTemp,
          nozzleTarget: telemetry.nozzleTarget,
          bedTarget: telemetry.bedTarget,
        },
        layer: telemetry.currentLayer,
      };

      this.send(progressMsg);

      if (telemetry.progressPercent >= 100) {
        this.send({
          type: 'job.done',
          jobId: this.currentJobId,
          metrics: {
            durationMinutes: 45,
            layers: telemetry.totalLayers,
          },
        });
        this.currentJobId = null;
      }
    }, 3000);
  }

  private handleMessage(raw: string): void {
    try {
      const parsed = JSON.parse(raw);
      const res = ServerMessage.safeParse(parsed);
      if (!res.success) return;

      const msg = res.data;
      if (msg.type === 'job.offer') {
        this.claimAndStartJob(msg.jobId);
      } else if (msg.type === 'ctrl') {
        if (msg.action === 'pause') this.config.printer.pause();
        else if (msg.action === 'cancel' || msg.action === 'estop') {
          this.config.printer.cancel();
          this.currentJobId = null;
        }
      }
    } catch {
      // Ignore invalid server frame
    }
  }

  private async claimAndStartJob(jobId: string): Promise<void> {
    this.currentJobId = jobId;
    this.send({ type: 'job.claim', jobId });

    // Dummy valid simulated G-code
    const simGcode = `
      M104 S240 ; set nozzle temp
      M140 S70  ; set bed temp
      G28 ; home
      G1 Z0.2 F1200
      G1 X100 Y100 E5
    `;

    await this.config.printer.startPrint(jobId, simGcode);
  }

  private send(msg: AgentMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private cleanup(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.heartbeatTimer = null;
    this.pollTimer = null;
  }
}
