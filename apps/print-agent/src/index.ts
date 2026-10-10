import { Command } from 'commander';
import { AgentWsClient } from './protocol/client';
import { SimulatorAdapter } from './adapters/simulator';
import { MoonrakerAdapter } from './adapters/moonraker';

const program = new Command();

program
  .name('keycap-agent')
  .description('Print Agent daemon for custom keycap 3D printers')
  .version('1.0.0');

program
  .command('start')
  .description('Start the print agent daemon')
  .option('-s, --server <url>', 'Server URL', process.env.KEYCAP_SERVER_URL || 'http://localhost:3000')
  .option('-a, --agent-id <id>', 'Agent ID', process.env.KEYCAP_AGENT_ID || 'agent-default-1')
  .option('-t, --token <token>', 'Agent Token', process.env.KEYCAP_AGENT_TOKEN || 'dev-agent-token')
  .option('-m, --moonraker <url>', 'Moonraker URL (defaults to simulator if omitted)')
  .action(async (opts) => {
    console.log(`🤖 Starting Keycap Print Agent [${opts.agentId}]...`);
    console.log(`Connecting to: ${opts.server}`);

    const printer = opts.moonraker
      ? new MoonrakerAdapter(opts.moonraker)
      : new SimulatorAdapter();

    console.log(`Using printer adapter: ${printer.kind}`);

    const client = new AgentWsClient({
      serverUrl: opts.server,
      agentId: opts.agentId,
      agentToken: opts.token,
      printer,
    });

    await client.start();
    console.log('✅ Agent running. Press Ctrl+C to terminate.');

    process.on('SIGINT', () => {
      console.log('Shutting down print agent...');
      client.stop();
      process.exit(0);
    });
  });

program
  .command('status')
  .description('Check local printer status')
  .action(async () => {
    const sim = new SimulatorAdapter();
    await sim.connect();
    const tel = await sim.getTelemetry();
    console.log('Printer Status:', tel);
  });

program.parse(process.argv);
