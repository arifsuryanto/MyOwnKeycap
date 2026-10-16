import { chromium } from '@playwright/test';
import path from 'path';

async function capture() {
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
  await page.waitForTimeout(2500);

  const canvasContainer = page.locator('div[class*="select-none"]').first();

  // Assembled View
  await canvasContainer.screenshot({ path: path.join(artifactDir, 'artisan_rubik_assembled_clean.png') });

  // Exploded View
  const explodeBtn = page.getByRole('button', { name: /Exploded View/i });
  if (await explodeBtn.isVisible()) {
    await explodeBtn.click();
    await page.waitForTimeout(1800);
    await canvasContainer.screenshot({ path: path.join(artifactDir, 'artisan_rubik_exploded_clean.png') });
  }

  await browser.close();
  console.log('Clean screenshots captured!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
