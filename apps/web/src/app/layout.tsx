import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Keycap Platform — Custom Keycap Desain AI',
    template: '%s | Keycap Platform',
  },
  description:
    'Desain keycap custom untuk keyboard mekanik dengan AI. Preview 3D real-time, bayar QRIS, dicetak & dikirim. Fit-guaranteed untuk model keyboard spesifik Anda.',
  keywords: [
    'keycap custom',
    'keycap mekanik',
    'desain keycap AI',
    'keyboard mekanik Indonesia',
    'cetak 3D keycap',
  ],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
