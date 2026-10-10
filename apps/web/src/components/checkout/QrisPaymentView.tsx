'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

interface QrisPaymentViewProps {
  orderId: string;
  amountIdr: number;
  qrString: string;
  expiresAt: string;
}

export default function QrisPaymentView({
  orderId,
  amountIdr,
  qrString,
  expiresAt,
}: QrisPaymentViewProps) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeftSec, setTimeLeftSec] = useState<number>(1800);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Menunggu Pembayaran...');

  // 1. Generate QR Code Data URL
  useEffect(() => {
    if (qrString) {
      QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#09090b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [qrString]);

  // 2. Countdown Timer
  useEffect(() => {
    const expiryTime = new Date(expiresAt).getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeftSec(diffSec);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  // 3. Polling for payment status
  useEffect(() => {
    if (isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) return;

        const data = await res.json();
        const order = data.data;

        if (order && (order.status === 'PAID' || order.status === 'QUEUED' || order.status === 'PRINTING')) {
          setIsPaid(true);
          setStatusText('Pembayaran Berhasil! Mengalihkan...');
          setTimeout(() => {
            router.push(`/orders/${orderId}`);
          }, 2000);
        } else if (order && order.status === 'EXPIRED') {
          setStatusText('Pembayaran Kadaluarsa');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, isPaid, router]);

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 shadow-2xl backdrop-blur-md text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-6">
        <span>⚡</span>
        <span>Pembayaran Instan QRIS</span>
      </div>

      <h1 className="text-2xl font-black text-white">Scan untuk Membayar</h1>
      <p className="mt-1 text-xs text-zinc-400">
        Buka GoPay, OVO, Dana, BCA, Livin&apos;, atau aplikasi perbankan Anda
      </p>

      {/* Amount Display */}
      <div className="my-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          Total Pembayaran
        </span>
        <div className="text-3xl font-black text-emerald-400 mt-1">
          Rp {amountIdr.toLocaleString('id-ID')}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">
          Order ID: <span className="font-mono text-zinc-300">{orderId}</span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="relative mx-auto my-6 flex h-[320px] w-[320px] items-center justify-center rounded-2xl bg-white p-3 shadow-2xl ring-4 ring-violet-500/20">
        {isPaid ? (
          <div className="flex flex-col items-center justify-center text-emerald-600">
            <svg
              className="h-24 w-24 animate-bounce text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-bold mt-2">LUNAS</span>
          </div>
        ) : qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QRIS Payment Code"
            className="h-full w-full object-contain rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center text-zinc-600">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            <span className="text-xs mt-3">Membuat QRIS...</span>
          </div>
        )}
      </div>

      {/* Timer & Status */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-mono font-bold text-amber-400">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
          </svg>
          {timeFormatted}
        </div>
        <span className="text-xs text-zinc-400 animate-pulse">{statusText}</span>
      </div>

      {/* Footer Instructions */}
      <div className="mt-8 border-t border-zinc-800/80 pt-6 text-left text-xs text-zinc-400 space-y-2">
        <p className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">✓</span>
          Otomatis terverifikasi tanpa perlu unggah bukti transfer.
        </p>
        <p className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">✓</span>
          Pesanan langsung masuk antrean cetak 3D begitu QRIS terbayar.
        </p>
      </div>
    </div>
  );
}
