---
name: playwright-e2e
description: Standard workflows, configurations, and test authoring guide for End-to-End (E2E) testing with Playwright in the MyOwnKeycap monorepo (Next.js 15, React 19, Prisma, WSL2).
---

# Playwright E2E Testing for MyOwnKeycap

Panduan dan standar pengujian End-to-End (E2E) menggunakan Playwright untuk platform MyOwnKeycap sesuai dengan spesifikasi di `KEYCAP_PLATFORM_SPEC.md` (§13.2).

## 1. Lokasi & Struktur Folder

File pengujian E2E berlokasi di aplikasi web:
```
apps/web/
├── playwright.config.ts            # Konfigurasi utama Playwright
└── tests/e2e/
    ├── 01-public-browsing.spec.ts  # Landing page, katalog keyboard, estimator
    ├── 02-keycap-designer.spec.ts  # AI Design studio, prompt, profil stem
    ├── 03-checkout-flow.spec.ts    # Alamat, pengiriman, checkout order
    ├── 04-webhook-mock.spec.ts     # Simulasi webhook payment Midtrans/QRIS -> PAID
    └── 05-admin-pipeline.spec.ts   # Dashboard admin, review order, print queue
```

## 2. Cara Menjalankan Test

### Dari Root Monorepo
```bash
# Menjalankan seluruh E2E test via Turborepo
pnpm test:e2e

# Atau filter spesifik apps/web
pnpm --filter @keycap/web test:e2e
```

### Opsi Tambahan Playwright
```bash
# Mode UI interaktif
pnpm --filter @keycap/web exec playwright test --ui

# Mode debug dengan Playwright Inspector
pnpm --filter @keycap/web exec playwright test --debug

# Menjalankan spec tertentu saja
pnpm --filter @keycap/web exec playwright test tests/e2e/01-public-browsing.spec.ts

# Melihat laporan hasil pengujian HTML
pnpm --filter @keycap/web exec playwright show-report
```

## 3. Lingkungan WSL2 (Ubuntu 22.04)

Karena project berada di filesystem WSL:
1. **Browser Binary**: Pastikan Chromium sudah terinstal di cache WSL:
   ```bash
   pnpm --filter @keycap/web exec playwright install chromium
   ```
2. **Headless Execution**: Playwright secara default berjalan dalam mode headless shell yang hemat resource dan tidak memerlukan display server (X11/Wayland).

## 4. Standar Penulisan Test

### A. Prioritas Skenario (Sesuai `KEYCAP_PLATFORM_SPEC.md` §13.2)
1. **Public Journey**:
   - Pengunjung membuka `/` -> melihat hero & CTA.
   - Mengunjungi `/keyboards` -> melihat daftar keyboard yang didukung (Keychron, RK, dll).
2. **Design & Customizer**:
   - Membuka `/design?model=keychron-q1` -> memuat layout keyboard.
   - Memasukkan prompt desain -> memicu generate skema warna & legend.
   - Validasi live quote & opsi material (PETG/PLA/ASA).
3. **Checkout & Payment**:
   - Checkout dari design -> mengisi form alamat pengiriman.
   - Generate simulasi pembayaran QRIS sandbox.
4. **Webhook Simulation**:
   - POST mock payload ke `/api/webhooks/payment/midtrans` dengan signature valid.
   - Verifikasi status order berubah dari `PENDING_PAYMENT` menjadi `PAID`.
5. **Admin & Fulfillment**:
   - Akses `/admin/orders` -> verifikasi order PAID muncul.
   - Pindahkan status ke print queue simulator.

### B. Otentikasi (NextAuth v5)
- Gunakan test user mock dari database seed: `e2e-tester@myownkeycap.id`.
- Untuk test authenticated, gunakan NextAuth session cookie injection atau fixture `request` API untuk membuat sesi sebelum mengunjungi route yang dilindungi.

### C. Isolasi Database
Sebelum menjalankan rangkaian pengujian lengkap pada lingkungan staging/CI:
```bash
# Pastikan schema termigrasi dan database di-seed
pnpm db:push
pnpm db:seed
```
