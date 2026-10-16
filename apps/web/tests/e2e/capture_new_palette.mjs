import { chromium } from '@playwright/test';
import path from 'path';

async function captureNewPalette() {
  const artifactDir = '/mnt/c/Users/Komputer/.gemini/antigravity-ide/brain/a57c2a6c-276b-4eb2-930f-c10801d04350';
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  // 1. Capture Hero with new Palette and Typography
  const heroPath = path.join(artifactDir, 'palette_hero_artisan.png');
  await page.screenshot({ path: heroPath });
  console.log('Saved:', heroPath);

  // 2. Click Exploded View to capture exploded state with new palette
  const explodeBtn = page.getByRole('button', { name: /Exploded View/i });
  if (await explodeBtn.isVisible()) {
    await explodeBtn.click();
    await page.waitForTimeout(1800);
    const explodedPath = path.join(artifactDir, 'palette_rubik_exploded.png');
    await page.screenshot({ path: explodedPath });
    console.log('Saved:', explodedPath);
    // Collapse back
    const mergeBtn = page.getByRole('button', { name: /Gabungkan Kubus/i });
    if (await mergeBtn.isVisible()) {
      await mergeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // 3. Capture Modular Packs
  await page.evaluate(() => window.scrollTo({ top: 780, behavior: 'instant' }));
  await page.waitForTimeout(1000);
  const packsPath = path.join(artifactDir, 'palette_modular_packs.png');
  await page.screenshot({ path: packsPath });
  console.log('Saved:', packsPath);

  // 4. Capture Soundboard & Pricing Estimator
  await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }));
  await page.waitForTimeout(1000);
  const soundboardPath = path.join(artifactDir, 'palette_soundboard_pricing.png');
  await page.screenshot({ path: soundboardPath });
  console.log('Saved:', soundboardPath);

  await browser.close();
  console.log('All palette screenshots captured successfully!');
}

captureNewPalette().catch((err) => {
  console.error('Error capturing palette screenshots:', err);
  process.exit(1);
});
