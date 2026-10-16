import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
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
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen bg-[#071E33] text-[#FAF0CA] antialiased selection:bg-[#F95738]/30 selection:text-[#FAF0CA]">
        {children}
      </body>
    </html>
  );
}
