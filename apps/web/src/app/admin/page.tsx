import { prisma, OrderStatus, PrintJobStatus } from '@keycap/db';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Layers,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Cpu,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatIdr(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOverviewPage() {
  // Aggregate real operational metrics from database
  const [
    totalOrders,
    paidOrders,
    recentEvents,
    activePrinters,
    printJobs,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: {
        status: {
          in: [
            OrderStatus.PAID,
            OrderStatus.QUEUED,
            OrderStatus.PENDING_APPROVAL,
            OrderStatus.PRINTING,
            OrderStatus.POST_PROCESSING,
            OrderStatus.QC,
            OrderStatus.PACKED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      select: { totalIdr: true, createdAt: true },
    }),
    prisma.orderEvent.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { order: true },
    }),
    prisma.printer.findMany({
      include: {
        printJobs: {
          where: { status: PrintJobStatus.PRINTING },
        },
      },
    }),
    prisma.printJob.findMany({
      where: {
        status: {
          in: [PrintJobStatus.PENDING, PrintJobStatus.PRINTING],
        },
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  const totalGmv = paidOrders.reduce((sum, o) => sum + o.totalIdr, 0);

  // Calculate estimated queue depth in hours
  const totalEstMinutes = printJobs.reduce((sum, job) => {
    const plate = (job.plateJson as Record<string, unknown>) ?? {};
    const mins = typeof plate['estMinutes'] === 'number' ? plate['estMinutes'] : 45;
    return sum + mins;
  }, 0);
  const queueDepthHours = (totalEstMinutes / 60).toFixed(1);

  const onlinePrintersCount = activePrinters.filter(
    (p) => p.enabled && (p.lastSeenAt ? Date.now() - new Date(p.lastSeenAt).getTime() < 180000 : true),
  ).length;

  const statusMap = new Map(ordersByStatus.map((s) => [s.status, s._count.id]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Workshop Operations Center
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time monitoring of production floor, print queue, telemetry, and fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/print-queue"
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Layers className="h-4 w-4" />
            Manage Print Queue
          </Link>
          <Link
            href="/admin/printers"
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition active:scale-95"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            Printer Fleet
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-yellow-500" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Merchandise Value</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatIdr(totalGmv)}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {paidOrders.length} paid orders fulfilled or in pipeline
          </p>
        </div>

        {/* Queue Depth */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Depth</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {queueDepthHours} <span className="text-sm font-normal text-zinc-400">Jam Cetak</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {printJobs.length} piringan/plates menunggu giliran
          </p>
        </div>

        {/* Active Printers */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Fleet</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {onlinePrintersCount} / {activePrinters.length}{' '}
            <span className="text-sm font-normal text-emerald-400">Online</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Simulator & Klipper Moonraker agents
          </p>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <PackageCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {totalOrders}{' '}
            <span className="text-sm font-normal text-zinc-400">Pesanan</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            From design studio & KLE imports
          </p>
        </div>
      </div>

      {/* Production Pipeline Funnel */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-400" />
          Manufacturing Pipeline Funnel
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
          {[
            { label: 'Queued', count: statusMap.get(OrderStatus.QUEUED) ?? 0, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/40' },
            { label: 'Printing', count: statusMap.get(OrderStatus.PRINTING) ?? 0, color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-800/40' },
            { label: 'Post Process', count: statusMap.get(OrderStatus.POST_PROCESSING) ?? 0, color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/40' },
            { label: 'QC Audit', count: statusMap.get(OrderStatus.QC) ?? 0, color: 'text-indigo-400', bg: 'bg-indigo-950/30 border-indigo-800/40' },
            { label: 'Packed', count: statusMap.get(OrderStatus.PACKED) ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/40' },
            { label: 'Shipped', count: statusMap.get(OrderStatus.SHIPPED) ?? 0, color: 'text-cyan-400', bg: 'bg-cyan-950/30 border-cyan-800/40' },
            { label: 'Delivered', count: statusMap.get(OrderStatus.DELIVERED) ?? 0, color: 'text-zinc-300', bg: 'bg-zinc-900 border-zinc-800' },
          ].map((stage) => (
            <div key={stage.label} className={`rounded-xl border p-3 ${stage.bg}`}>
              <div className={`text-xl font-bold ${stage.color}`}>{stage.count}</div>
              <div className="text-xs text-zinc-400 mt-1">{stage.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed & Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Order Events */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              Live Workshop Event Stream
            </h2>
            <Link href="/admin/orders" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {recentEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                Belum ada aktivitas. Buat pesanan baru dari Storefront untuk melihat aliran produksi!
              </p>
            ) : (
              recentEvents.map((ev) => (
                <div key={ev.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                      {ev.to === OrderStatus.DELIVERED ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : ev.to === OrderStatus.PRINT_FAILED ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Layers className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        <Link href={`/orders/${ev.order.id}`} className="hover:underline text-amber-400 font-mono">
                          {ev.order.publicCode}
                        </Link>
                        <span className="text-xs text-zinc-400">
                          {ev.from ? `${ev.from} → ` : ''}
                          <span className="font-semibold text-zinc-200">{ev.to}</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {ev.meta ? JSON.stringify(ev.meta) : 'State transition completed'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(ev.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Action Cards */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              SOP Quality Assurance
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Setiap keycap melewati pencucian alkohol 99%, UV curing, pengecekan ketebalan dinding minimal 1.4mm, dan uji fit switch MX stem sebelum di-pack.
            </p>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Standar Stem</span>
              <span className="font-mono text-zinc-300">Cherry MX Standard</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Material Utama</span>
              <span className="font-mono text-amber-400 font-medium">PETG (240°C / 75°C)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white mb-2">Simulated Hardware Agent</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Agent simulator aktif menjalankan virtual G-code slicing dan thermal cycles untuk pengujian instan tanpa merusak filament fisik.
            </p>
            <Link
              href="/admin/printers"
              className="block w-full text-center rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2 text-xs font-semibold text-zinc-200 transition"
            >
              Cek Suhu & Status Mesin →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
