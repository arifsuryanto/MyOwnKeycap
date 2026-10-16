import { test, expect } from '@playwright/test';

test.describe('Keycap Design Studio', () => {
  test('loads design studio with keyboard model selector and controls', async ({ page }) => {
    await page.goto('/design');

    // Page title and metadata
    await expect(page).toHaveTitle(/AI Design Studio/);

    // Verify main interactive components exist
    const promptInput = page.locator('textarea');
    await expect(promptInput).toBeVisible();

    // Verify profile buttons (Cherry / OEM)
    const cherryBtn = page.getByRole('button', { name: 'Cherry', exact: false });
    const oemBtn = page.getByRole('button', { name: 'OEM', exact: false });
    await expect(cherryBtn).toBeVisible();
    await expect(oemBtn).toBeVisible();

    // Verify model selector is available
    const modelSelect = page.locator('select');
    await expect(modelSelect).toBeVisible();
  });

  test('clicking preset prompt populates prompt textarea', async ({ page }) => {
    await page.goto('/design');

    const promptTextarea = page.locator('textarea');
    await expect(promptTextarea).toHaveValue('');

    // Click the first preset prompt button
    const firstPreset = page.locator('button', { hasText: 'Retro 80s Synthwave' });
    if (await firstPreset.isVisible()) {
      await firstPreset.click();
      await expect(promptTextarea).not.toHaveValue('');
    }
  });

  test('allows selecting WASD gamer pack and updates key count and bundle tier', async ({ page }) => {
    await page.goto('/design');

    // Find and click WASD Gamer Pack button in KeySelectionToolbar
    const wasdBtn = page.locator('button', { hasText: 'WASD Gamer Pack' });
    await expect(wasdBtn).toBeVisible();
    await wasdBtn.click();

    // Verify badge updates to 4 Tombol and Sampler tier
    await expect(page.getByText('4 /')).toBeVisible();
    await expect(page.getByText(/Sampler Tier/i)).toBeVisible();

    // Verify checkout button text updates to 4 Tombol
    await expect(page.locator('a', { hasText: 'Pesan 4 Tombol' })).toBeVisible();
  });

  test('switches to 3D Studio tab and mounts WebGL Three.js canvas', async ({ page }) => {
    await page.goto('/design');

    // Click 3D Studio tab button
    const tab3D = page.locator('button', { hasText: '3D Studio' });
    await expect(tab3D).toBeVisible();
    await tab3D.click();

    // Verify 3D Canvas engine badge and canvas element
    await expect(page.getByText('Three.js WebGL Engine')).toBeVisible();
    const canvasElement = page.locator('canvas');
    await expect(canvasElement).toBeVisible();
  });

  test('attaches image relief to keycaps and displays relief badge', async ({ page }) => {
    await page.goto('/design');

    // Click sample relief preset "Cyber Skull"
    const sampleReliefBtn = page.locator('button', { hasText: 'Cyber Skull' });
    await expect(sampleReliefBtn).toBeVisible();
    await sampleReliefBtn.click();

    // Verify active relief badge is visible
    await expect(page.getByText(/Cyber Skull/i)).toBeVisible();
    await expect(page.getByText(/Heightmap Aktif/i)).toBeVisible();
  });
});

