import { chromium } from '@playwright/test';
import path from 'path';

async function captureArtisanRubik() {
  const artifactDir = process.platform === 'win32'
    ? 'C:/Users/Komputer/.gemini/antigravity-ide/brain/953bb264-8a75-43e4-9f2c-f953355d9583'
    : '/mnt/c/Users/Komputer/.gemini/antigravity-ide/brain/953bb264-8a75-43e4-9f2c-f953355d9583';
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const canvasContainer = page.locator('div[class*="select-none"]').first();

  // 1. Trigger Slide Action (Slide Top Layer)
  console.log('Opening Slide Action menu...');
  const slideMenuBtn = page.getByRole('button', { name: /Slide Action/i });
  if (await slideMenuBtn.isVisible()) {
    await slideMenuBtn.click();
    await page.waitForTimeout(500);

    const slideTopBtn = page.getByRole('button', { name: /Slide Top Layer/i });
    if (await slideTopBtn.isVisible()) {
      console.log('Clicking Slide Top Layer...');
      await slideTopBtn.click();
      await page.waitForTimeout(1600); // Wait for slice rotation animation

      const slidePath = path.join(artifactDir, 'artisan_rubik_slide_top.png');
      await canvasContainer.screenshot({ path: slidePath });
      console.log('Saved:', slidePath);
    }
  }

  // 2. Trigger Shuffle Slide (Another random layer)
  const shuffleBtn = page.getByRole('button', { name: /Shuffle/i });
  if (await shuffleBtn.isVisible()) {
    console.log('Clicking Shuffle Slide button...');
    await shuffleBtn.click();
    await page.waitForTimeout(1600);

    const shuffledPath = path.join(artifactDir, 'artisan_rubik_slide_shuffled.png');
    await canvasContainer.screenshot({ path: shuffledPath });
    console.log('Saved:', shuffledPath);
  }

  await browser.close();
  console.log('Slide action screenshots captured successfully!');
}

captureArtisanRubik().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
