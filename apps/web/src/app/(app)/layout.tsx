import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* App Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <a href="/" className="text-lg font-bold text-white">
            Keycap
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="/app/designs" className="text-zinc-400 hover:text-white transition">
              Desain Saya
            </a>
            <a href="/app/orders" className="text-zinc-400 hover:text-white transition">
              Pesanan
            </a>
            <a href="/app/credits" className="text-zinc-400 hover:text-white transition">
              Kredit AI
            </a>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
              <span className="text-zinc-300">{session.user.name ?? session.user.email}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
