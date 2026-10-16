import { chromium } from '@playwright/test';
import path from 'path';

async function captureClaymorphicLanding() {
  const artifactDir = '/mnt/c/Users/Komputer/.gemini/antigravity-ide/brain/a57c2a6c-276b-4eb2-930f-c10801d04350';
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 1. Capture Hero with Borderless 3D Floating Rubik Icon Centerpiece
  const heroPath = path.join(artifactDir, 'clay_hero_floating_rubik.png');
  await page.screenshot({ path: heroPath });
  console.log('Hero screenshot saved:', heroPath);

  // 2. Capture Modular Packs with Generated Clay Images
  const modularTitle = page.getByText('Pilih Paket Modular Favorit Anda');
  if (await modularTitle.isVisible()) {
    await modularTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const packsPath = path.join(artifactDir, 'clay_modular_packs.png');
    await page.screenshot({ path: packsPath });
    console.log('Modular packs screenshot saved:', packsPath);
  }

  // 3. Capture Soundboard Lab
  const soundboard = page.getByText('Uji Resonansi Suara Keycap 1.5mm');
  if (await soundboard.isVisible()) {
    await soundboard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const sbPath = path.join(artifactDir, 'clay_soundboard_oscilloscope.png');
    await page.screenshot({ path: sbPath });
    console.log('Soundboard screenshot saved:', sbPath);
  }

  // 4. Capture Anatomy & Craftsmanship with Cross-Section Image
  const anatomy = page.getByText('Anatomi Keycap Standar Atelier');
  if (await anatomy.isVisible()) {
    await anatomy.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const anatPath = path.join(artifactDir, 'clay_anatomy_craftsmanship.png');
    await page.screenshot({ path: anatPath });
    console.log('Anatomy & Craftsmanship screenshot saved:', anatPath);
  }

  // 5. Capture How It Works with Workshop Image
  const howitworks = page.getByText('Bagaimana Cara Kerjanya?');
  if (await howitworks.isVisible()) {
    await howitworks.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const hiwPath = path.join(artifactDir, 'clay_how_it_works.png');
    await page.screenshot({ path: hiwPath });
    console.log('How it works screenshot saved:', hiwPath);
  }

  // 6. Capture Pricing Estimator
  const estimator = page.getByText('Hitung Biaya Keycap Kustom Anda');
  if (await estimator.isVisible()) {
    await estimator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const estPath = path.join(artifactDir, 'clay_pricing_estimator.png');
    await page.screenshot({ path: estPath });
    console.log('Estimator screenshot saved:', estPath);
  }

  // 7. Capture Community Gallery Builds
  const community = page.getByText('Dipercaya Komunitas Mechanical Keyboard');
  if (await community.isVisible()) {
    await community.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const commPath = path.join(artifactDir, 'clay_community_reviews.png');
    await page.screenshot({ path: commPath });
    console.log('Community reviews screenshot saved:', commPath);
  }

  await browser.close();
  console.log('All claymorphic screenshots captured successfully!');
}

captureClaymorphicLanding().catch((err) => {
  console.error('Error capturing claymorphic landing:', err);
  process.exit(1);
});
