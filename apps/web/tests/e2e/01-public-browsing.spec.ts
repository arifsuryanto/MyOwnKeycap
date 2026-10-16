import { test, expect } from '@playwright/test';

test.describe('Public Browsing & Navigation', () => {
  test('homepage renders hero title, badges, and call-to-actions', async ({ page }) => {
    await page.goto('/');

    // Check editorial hero heading
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toContainText('Sentuhan Tactile');
    await expect(heroTitle).toContainText('Karya Seni di Atas Switch');

    // Check CTA links visible in main hero
    const ctaKeyboards = page.locator('main a[href="/keyboards"]', { hasText: 'Pilih Model Keyboard' });
    await expect(ctaKeyboards).toBeVisible();

    const ctaDesignStudio = page.locator('main a[href="/design"]', { hasText: 'Buka Studio 3D Langsung' });
    await expect(ctaDesignStudio).toBeVisible();

    const ctaEstimator = page.locator('main a[href="/estimator"]').first();
    await expect(ctaEstimator).toBeVisible();
  });

  test('homepage mounts interactive 3D Rubik keycap canvas and controls', async ({ page }) => {
    await page.goto('/');

    // Verify 3D Rubik container and header metadata
    await expect(page.getByText(/Rubik's MX-26/i)).toBeVisible();
    await expect(page.getByText(/26 Sculpted 3D Miniatures/i)).toBeVisible();

    // Verify Three.js WebGL canvas is mounted
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Verify interactive controls (Exploded view, Slice twist, Audio)
    const explodeBtn = page.getByRole('button', { name: /Exploded View/i });
    await expect(explodeBtn).toBeVisible();

    const twistBtn = page.getByRole('button', { name: /Putar Slice Top 90°/i });
    await expect(twistBtn).toBeVisible();

    // Sound toggle uses title attribute matching both mobile & desktop
    const audioBtn = page.locator('button[title*="Suara Thock"]');
    await expect(audioBtn).toBeVisible();

    // Test clicking Exploded View toggle
    await explodeBtn.click();
    await expect(page.getByRole('button', { name: /Gabungkan Kubus/i })).toBeVisible();
    await page.getByRole('button', { name: /Gabungkan Kubus/i }).click();
    await expect(page.getByRole('button', { name: /Exploded View/i })).toBeVisible();
  });

  test('homepage showcases modular keycap packs (WASD, Arrows, 3D Relief)', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('WASD Gamer Cluster')).toBeVisible();
    await expect(page.getByText('Arrow Cluster Navigation')).toBeVisible();
    await expect(page.getByText('Bespoke Image Relief 3D')).toBeVisible();
  });

  test('navigates from homepage to keyboards catalog', async ({ page }) => {
    await page.goto('/');
    const catalogLink = page.locator('main a[href="/keyboards"]').first();
    await catalogLink.click();

    // Wait for Next.js navigation with adequate compiler headroom
    await page.waitForURL(/\/keyboards/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/keyboards/);
    await expect(page).toHaveTitle(/Katalog Keyboard/);
  });

  test('login page loads with authentication form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toHaveText('Masuk ke Keycap');
    await expect(page.getByText('Login untuk menyimpan desain dan melakukan pemesanan')).toBeVisible();
  });
});
