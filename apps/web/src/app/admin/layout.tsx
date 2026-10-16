import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Printer,
  Layers,
  ShoppingBag,
  Sliders,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';

  // In production, strictly enforce ADMIN role
  if (!isDev && (!session?.user || session.user.role !== 'ADMIN')) {
    redirect('/login?error=unauthorized');
  }

  const userEmail = session?.user?.email ?? 'operator@myownkeycap.id';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Admin Banner */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                MyOwnKeycap
              </span>
            </Link>

            <div className="flex items-center gap-1.5 rounded-full bg-red-950/40 border border-red-800/50 px-2.5 py-0.5 text-xs font-semibold text-red-400">
              <Shield className="h-3 w-3" />
              <span>COMMAND CENTER</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <LayoutDashboard className="h-4 w-4 text-zinc-400" />
              Overview
            </Link>
            <Link
              href="/admin/print-queue"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <Layers className="h-4 w-4 text-amber-400" />
              Print Queue
            </Link>
            <Link
              href="/admin/printers"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              3D Printers
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <ShoppingBag className="h-4 w-4 text-blue-400" />
              Orders & QC
            </Link>
            <Link
              href="/admin/keyboards"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <Sliders className="h-4 w-4 text-purple-400" />
              Katalog
            </Link>
            <Link
              href="/admin/pricing"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              Pricing Engine
            </Link>
          </nav>

          {/* User badge */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono">{userEmail}</span>
            </div>
            <Link
              href="/catalog"
              className="text-xs text-zinc-400 hover:text-white transition underline"
            >
              Storefront ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
