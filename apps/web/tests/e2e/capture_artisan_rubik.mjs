import { chromium } from '@playwright/test';
import path from 'path';

async function captureArtisanRubik() {
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

  // 1. Capture Normal State with Hand-Sculpted 3D Artisan Keycaps
  const heroPath = path.join(artifactDir, 'artisan_rubik_hero.png');
  await page.screenshot({ path: heroPath });
  console.log('Saved:', heroPath);

  // 2. Click Exploded View button
  const explodeBtn = page.getByRole('button', { name: /Exploded View/i });
  if (await explodeBtn.isVisible()) {
    await explodeBtn.click();
    await page.waitForTimeout(1500);
    const explodedPath = path.join(artifactDir, 'artisan_rubik_exploded.png');
    await page.screenshot({ path: explodedPath });
    console.log('Saved:', explodedPath);

    // Click back to assemble
    await explodeBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Click Slice Twist 90° button
  const twistBtn = page.getByRole('button', { name: /Putar Slice Top 90/i });
  if (await twistBtn.isVisible()) {
    await twistBtn.click();
    await page.waitForTimeout(1500);
    const twistedPath = path.join(artifactDir, 'artisan_rubik_twisted.png');
    await page.screenshot({ path: twistedPath });
    console.log('Saved:', twistedPath);
  }

  await browser.close();
  console.log('All artisan rubik screenshots captured successfully!');
}

captureArtisanRubik().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
