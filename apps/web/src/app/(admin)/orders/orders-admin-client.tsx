'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  MapPin,
  RefreshCw,
  Box,
} from 'lucide-react';

interface OrdersAdminClientProps {
  initialOrders: any[];
}

function formatIdr(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function OrdersAdminClient({ initialOrders }: OrdersAdminClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = initialOrders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const handleQc = async (orderId: string, pass: boolean) => {
    let notes: string | undefined;
    if (!pass) {
      notes = prompt('Catatan cacat QC (misal: stem longgar, stringing parah):') || undefined;
      if (!notes) return;
    }

    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass, notes }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`QC Error: ${err.error || 'Failed'}`);
        return;
      }
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleShip = async (orderId: string) => {
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier: 'jne', service: 'REG' }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Shipping Error: ${err.error || 'Failed'}`);
        return;
      }
      const data = await res.json();
      alert(`Berhasil! Nomor resi terbit: ${data.shipment.waybillNumber}`);
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'QUEUED', 'PRINTING', 'QC', 'PACKED', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === st
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-12 text-center text-zinc-500">
          <p className="text-base font-medium">Tidak ada pesanan dengan status {filter}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const isLoading = loadingId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm transition hover:border-zinc-700"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-amber-400">
                        {order.publicCode}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          order.status === 'QC'
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60 animate-pulse'
                            : order.status === 'PACKED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : order.status === 'SHIPPED'
                                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-white flex flex-wrap items-center gap-3">
                      <span>Total: <strong className="text-amber-300">{formatIdr(order.totalIdr)}</strong></span>
                      <span className="text-zinc-600">•</span>
                      <span>Customer: {order.user?.name || order.user?.email}</span>
                      {order.trackingNumber && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-cyan-400 flex items-center gap-1 font-mono text-xs">
                            <Truck className="h-3 w-3" /> Resi: {order.trackingNumber}
                          </span>
                        </>
                      )}
                    </div>

                    {order.address && (
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>
                          {order.address.recipientName} ({order.address.phone}) — {order.address.addressLine}, {order.address.city} {order.address.postalCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Detail
                    </Link>

                    {/* QC stage actions */}
                    {order.status === 'QC' && (
                      <>
                        <button
                          onClick={() => handleQc(order.id, true)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {isLoading ? 'Processing...' : 'Pass QC (Siap Packing)'}
                        </button>
                        <button
                          onClick={() => handleQc(order.id, false)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-800 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-2 text-xs font-semibold text-rose-300 transition active:scale-95 disabled:opacity-50"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Reject QC & Reprint
                        </button>
                      </>
                    )}

                    {/* PACKED stage actions */}
                    {order.status === 'PACKED' && (
                      <button
                        onClick={() => handleShip(order.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        {isLoading ? 'Creating AWB...' : 'Dispatch Shipment (Biteship)'}
                      </button>
                    )}

                    {order.status === 'SHIPPED' && (
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1.5 rounded-xl">
                        <Truck className="h-3.5 w-3.5" />
                        In Transit with Courier
                      </div>
                    )}

                    {order.status === 'DELIVERED' && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Delivered to Customer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
