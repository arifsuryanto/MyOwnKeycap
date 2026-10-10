import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Keyboard Models (10 popular models) ────────────────────
  const keyboards = await Promise.all([
    prisma.keyboardModel.upsert({
      where: { slug: 'keychron-q1-v2' },
      update: {},
      create: {
        slug: 'keychron-q1-v2',
        brand: 'Keychron',
        name: 'Q1 V2',
        switchType: 'MX',
        keyCount: 82,
        verified: true,
        sourceNote: 'Verified against physical unit',
        layoutJson: { name: 'Keychron Q1 V2 75%', keys: generateLayout75() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'keychron-v1' },
      update: {},
      create: {
        slug: 'keychron-v1',
        brand: 'Keychron',
        name: 'V1',
        switchType: 'MX',
        keyCount: 82,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Keychron V1 75%', keys: generateLayout75() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'akko-3068b' },
      update: {},
      create: {
        slug: 'akko-3068b',
        brand: 'Akko',
        name: '3068B',
        switchType: 'MX',
        keyCount: 68,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Akko 3068B 65%', keys: generateLayout65() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'royal-kludge-rk61' },
      update: {},
      create: {
        slug: 'royal-kludge-rk61',
        brand: 'Royal Kludge',
        name: 'RK61',
        switchType: 'MX',
        keyCount: 61,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'RK61 60%', keys: generateLayout60() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'ducky-one-3-sf' },
      update: {},
      create: {
        slug: 'ducky-one-3-sf',
        brand: 'Ducky',
        name: 'One 3 SF',
        switchType: 'MX',
        keyCount: 65,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Ducky One 3 SF 65%', keys: generateLayout65() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'epomaker-th80' },
      update: {},
      create: {
        slug: 'epomaker-th80',
        brand: 'Epomaker',
        name: 'TH80',
        switchType: 'MX',
        keyCount: 80,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Epomaker TH80 75%', keys: generateLayout75() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'leopold-fc660m' },
      update: {},
      create: {
        slug: 'leopold-fc660m',
        brand: 'Leopold',
        name: 'FC660M',
        switchType: 'MX',
        keyCount: 66,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Leopold FC660M 65%', keys: generateLayout65() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'varmilo-va87m' },
      update: {},
      create: {
        slug: 'varmilo-va87m',
        brand: 'Varmilo',
        name: 'VA87M',
        switchType: 'MX',
        keyCount: 87,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Varmilo VA87M TKL', keys: generateLayoutTKL() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'keychron-k2-v2' },
      update: {},
      create: {
        slug: 'keychron-k2-v2',
        brand: 'Keychron',
        name: 'K2 V2',
        switchType: 'MX',
        keyCount: 84,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Keychron K2 V2 75%', keys: generateLayout75() },
      },
    }),
    prisma.keyboardModel.upsert({
      where: { slug: 'akko-5075b-plus' },
      update: {},
      create: {
        slug: 'akko-5075b-plus',
        brand: 'Akko',
        name: '5075B Plus',
        switchType: 'MX',
        keyCount: 82,
        verified: true,
        sourceNote: 'KLE reference layout',
        layoutJson: { name: 'Akko 5075B Plus 75%', keys: generateLayout75() },
      },
    }),
  ]);

  console.log(`  ✅ ${keyboards.length} keyboard models seeded`);

  // ─── Bundles ────────────────────────────────────────────────
  const bundles = await Promise.all([
    prisma.bundle.upsert({
      where: { code: 'SAMPLER' },
      update: {},
      create: {
        code: 'SAMPLER',
        name: 'Sampler Pack',
        description: '1-4 keycaps to test fit and quality',
        ruleJson: { minKeys: 1, maxKeys: 4, discountPercent: 0 },
        active: true,
      },
    }),
    prisma.bundle.upsert({
      where: { code: 'ACCENT' },
      update: {},
      create: {
        code: 'ACCENT',
        name: 'Accent Pack',
        description: 'Key modifiers: Esc, Enter, Space, Shift, and more (8-20 keys)',
        ruleJson: { minKeys: 8, maxKeys: 20, discountPercent: 5 },
        active: true,
      },
    }),
    prisma.bundle.upsert({
      where: { code: 'FULL_SET' },
      update: {},
      create: {
        code: 'FULL_SET',
        name: 'Full Set',
        description: 'Complete keycap set for your entire keyboard',
        ruleJson: { minKeys: 50, maxKeys: 200, discountPercent: 15 },
        active: true,
      },
    }),
    prisma.bundle.upsert({
      where: { code: 'EARLY_BIRD_65' },
      update: {},
      create: {
        code: 'EARLY_BIRD_65',
        name: 'Early Bird 65% Full Set',
        description: 'Limited early bird pricing for 65% layouts',
        ruleJson: { minKeys: 65, maxKeys: 70, discountPercent: 25, layoutType: '65%' },
        fixedPriceIdr: 749000,
        active: true,
        stockSlots: 30,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    }),
  ]);

  console.log(`  ✅ ${bundles.length} bundles seeded`);

  // ─── Pricing Config ─────────────────────────────────────────
  const pricingConfig = await prisma.pricingConfig.upsert({
    where: { version: 1 },
    update: {},
    create: {
      version: 1,
      active: true,
      createdById: 'system',
      json: {
        filamentCostPerGram: 300, // IDR (PETG ~Rp 300.000/kg)
        machineRatePerHour: 4000, // IDR (electricity + depreciation + maintenance)
        laborRatePerHour: 20000, // IDR (post-processing)
        postProcessMinutes: 5, // minutes per key
        packagingPerKey: 500, // IDR (amortized)
        failureRate: 0.15, // 15%
        targetMargin: 0.55, // 55%
        roundTo: 500, // Round to nearest Rp 500
        progressiveDiscount: [
          { minQty: 1, maxQty: 4, discountPercent: 0 },
          { minQty: 5, maxQty: 19, discountPercent: 5 },
          { minQty: 20, maxQty: 49, discountPercent: 10 },
          { minQty: 50, maxQty: 999, discountPercent: 15 },
        ],
        supportWasteMultiplier: 1.2, // 20% extra for supports/waste
      },
    },
  });

  console.log(`  ✅ Pricing config v${pricingConfig.version} seeded`);

  // ─── Simulator Printer & Agent ──────────────────────────────
  const agent = await prisma.agent.upsert({
    where: { id: 'agent-simulator-001' },
    update: {},
    create: {
      id: 'agent-simulator-001',
      name: 'Dev Simulator Agent',
      publicKey: 'dev-simulator-public-key-placeholder',
      lastSeenAt: new Date(),
    },
  });

  const printer = await prisma.printer.upsert({
    where: { id: 'printer-simulator-001' },
    update: {},
    create: {
      id: 'printer-simulator-001',
      name: 'Simulator Printer',
      adapter: 'SIMULATOR',
      bedX: 256,
      bedY: 256,
      bedZ: 256,
      agentId: agent.id,
      maxNozzleC: 300,
      maxBedC: 120,
      enabled: true,
      lastSeenAt: new Date(),
    },
  });

  console.log(`  ✅ Agent "${agent.name}" + Printer "${printer.name}" seeded`);

  // ─── Filament Inventory ─────────────────────────────────────
  const filaments = await Promise.all([
    prisma.filament.upsert({
      where: { id: 'filament-petg-black' },
      update: {},
      create: {
        id: 'filament-petg-black',
        material: 'PETG',
        color: 'Black',
        brand: 'eSUN',
        costPerKgIdr: 300000,
        remainingG: 800,
      },
    }),
    prisma.filament.upsert({
      where: { id: 'filament-petg-white' },
      update: {},
      create: {
        id: 'filament-petg-white',
        material: 'PETG',
        color: 'White',
        brand: 'eSUN',
        costPerKgIdr: 300000,
        remainingG: 950,
      },
    }),
  ]);

  console.log(`  ✅ ${filaments.length} filament spools seeded`);

  console.log('✨ Seeding complete!');
}

// ─── Layout Generators (simplified KLE-compatible) ───────────

function generateLayout60(): object[] {
  // 60% layout: 5 rows, 61 keys
  return [
    // Row 0 (number row)
    { id: 'esc', label: 'Esc', size: 1, row: 0, col: 0 },
    { id: '1', label: '1', size: 1, row: 0, col: 1 },
    { id: '2', label: '2', size: 1, row: 0, col: 2 },
    { id: '3', label: '3', size: 1, row: 0, col: 3 },
    { id: '4', label: '4', size: 1, row: 0, col: 4 },
    { id: '5', label: '5', size: 1, row: 0, col: 5 },
    { id: '6', label: '6', size: 1, row: 0, col: 6 },
    { id: '7', label: '7', size: 1, row: 0, col: 7 },
    { id: '8', label: '8', size: 1, row: 0, col: 8 },
    { id: '9', label: '9', size: 1, row: 0, col: 9 },
    { id: '0', label: '0', size: 1, row: 0, col: 10 },
    { id: 'minus', label: '-', size: 1, row: 0, col: 11 },
    { id: 'equals', label: '=', size: 1, row: 0, col: 12 },
    { id: 'backspace', label: 'Backspace', size: 2, row: 0, col: 13 },
    // Row 1 (QWERTY)
    { id: 'tab', label: 'Tab', size: 1.5, row: 1, col: 0 },
    { id: 'q', label: 'Q', size: 1, row: 1, col: 1.5 },
    { id: 'w', label: 'W', size: 1, row: 1, col: 2.5 },
    { id: 'e', label: 'E', size: 1, row: 1, col: 3.5 },
    { id: 'r', label: 'R', size: 1, row: 1, col: 4.5 },
    { id: 't', label: 'T', size: 1, row: 1, col: 5.5 },
    { id: 'y', label: 'Y', size: 1, row: 1, col: 6.5 },
    { id: 'u', label: 'U', size: 1, row: 1, col: 7.5 },
    { id: 'i', label: 'I', size: 1, row: 1, col: 8.5 },
    { id: 'o', label: 'O', size: 1, row: 1, col: 9.5 },
    { id: 'p', label: 'P', size: 1, row: 1, col: 10.5 },
    { id: 'lbracket', label: '[', size: 1, row: 1, col: 11.5 },
    { id: 'rbracket', label: ']', size: 1, row: 1, col: 12.5 },
    { id: 'backslash', label: '\\', size: 1.5, row: 1, col: 13.5 },
    // Row 2 (home row)
    { id: 'capslock', label: 'Caps', size: 1.75, row: 2, col: 0 },
    { id: 'a', label: 'A', size: 1, row: 2, col: 1.75 },
    { id: 's', label: 'S', size: 1, row: 2, col: 2.75 },
    { id: 'd', label: 'D', size: 1, row: 2, col: 3.75 },
    { id: 'f', label: 'F', size: 1, row: 2, col: 4.75 },
    { id: 'g', label: 'G', size: 1, row: 2, col: 5.75 },
    { id: 'h', label: 'H', size: 1, row: 2, col: 6.75 },
    { id: 'j', label: 'J', size: 1, row: 2, col: 7.75 },
    { id: 'k', label: 'K', size: 1, row: 2, col: 8.75 },
    { id: 'l', label: 'L', size: 1, row: 2, col: 9.75 },
    { id: 'semicolon', label: ';', size: 1, row: 2, col: 10.75 },
    { id: 'quote', label: "'", size: 1, row: 2, col: 11.75 },
    { id: 'enter', label: 'Enter', size: 2.25, row: 2, col: 12.75 },
    // Row 3 (shift row)
    { id: 'lshift', label: 'Shift', size: 2.25, row: 3, col: 0 },
    { id: 'z', label: 'Z', size: 1, row: 3, col: 2.25 },
    { id: 'x', label: 'X', size: 1, row: 3, col: 3.25 },
    { id: 'c', label: 'C', size: 1, row: 3, col: 4.25 },
    { id: 'v', label: 'V', size: 1, row: 3, col: 5.25 },
    { id: 'b', label: 'B', size: 1, row: 3, col: 6.25 },
    { id: 'n', label: 'N', size: 1, row: 3, col: 7.25 },
    { id: 'm', label: 'M', size: 1, row: 3, col: 8.25 },
    { id: 'comma', label: ',', size: 1, row: 3, col: 9.25 },
    { id: 'period', label: '.', size: 1, row: 3, col: 10.25 },
    { id: 'slash', label: '/', size: 1, row: 3, col: 11.25 },
    { id: 'rshift', label: 'Shift', size: 2.75, row: 3, col: 12.25 },
    // Row 4 (bottom row)
    { id: 'lctrl', label: 'Ctrl', size: 1.25, row: 4, col: 0 },
    { id: 'lgui', label: 'Win', size: 1.25, row: 4, col: 1.25 },
    { id: 'lalt', label: 'Alt', size: 1.25, row: 4, col: 2.5 },
    { id: 'space', label: '', size: 6.25, row: 4, col: 3.75 },
    { id: 'ralt', label: 'Alt', size: 1.25, row: 4, col: 10 },
    { id: 'rgui', label: 'Win', size: 1.25, row: 4, col: 11.25 },
    { id: 'menu', label: 'Menu', size: 1.25, row: 4, col: 12.5 },
    { id: 'rctrl', label: 'Ctrl', size: 1.25, row: 4, col: 13.75 },
  ];
}

function generateLayout65(): object[] {
  // 65%: 60% + arrow cluster + right column (Del, PgUp, PgDn)
  const base = generateLayout60();
  return [
    ...base,
    { id: 'del', label: 'Del', size: 1, row: 0, col: 15 },
    { id: 'pgup', label: 'PgUp', size: 1, row: 1, col: 15 },
    { id: 'pgdn', label: 'PgDn', size: 1, row: 2, col: 15 },
    { id: 'up', label: '↑', size: 1, row: 3, col: 14.25 },
    { id: 'left', label: '←', size: 1, row: 4, col: 13.5 },
    { id: 'down', label: '↓', size: 1, row: 4, col: 14.5 },
    { id: 'right', label: '→', size: 1, row: 4, col: 15.5 },
  ];
}

function generateLayout75(): object[] {
  // 75%: 65% + function row + extras
  const base65 = generateLayout65();
  const fnRow = [
    { id: 'esc_fn', label: 'Esc', size: 1, row: -1, col: 0 },
    { id: 'f1', label: 'F1', size: 1, row: -1, col: 1.25 },
    { id: 'f2', label: 'F2', size: 1, row: -1, col: 2.25 },
    { id: 'f3', label: 'F3', size: 1, row: -1, col: 3.25 },
    { id: 'f4', label: 'F4', size: 1, row: -1, col: 4.25 },
    { id: 'f5', label: 'F5', size: 1, row: -1, col: 5.5 },
    { id: 'f6', label: 'F6', size: 1, row: -1, col: 6.5 },
    { id: 'f7', label: 'F7', size: 1, row: -1, col: 7.5 },
    { id: 'f8', label: 'F8', size: 1, row: -1, col: 8.5 },
    { id: 'f9', label: 'F9', size: 1, row: -1, col: 9.75 },
    { id: 'f10', label: 'F10', size: 1, row: -1, col: 10.75 },
    { id: 'f11', label: 'F11', size: 1, row: -1, col: 11.75 },
    { id: 'f12', label: 'F12', size: 1, row: -1, col: 12.75 },
    { id: 'prtsc', label: 'PrtSc', size: 1, row: -1, col: 14 },
  ];
  return [...fnRow, ...base65];
}

function generateLayoutTKL(): object[] {
  // TKL: 75% concept + navigation cluster (simplified)
  const base75 = generateLayout75();
  const navCluster = [
    { id: 'ins', label: 'Ins', size: 1, row: 0, col: 16.5 },
    { id: 'home', label: 'Home', size: 1, row: 0, col: 17.5 },
    { id: 'pgup_tkl', label: 'PgUp', size: 1, row: 0, col: 18.5 },
    { id: 'del_tkl', label: 'Del', size: 1, row: 1, col: 16.5 },
    { id: 'end', label: 'End', size: 1, row: 1, col: 17.5 },
    { id: 'pgdn_tkl', label: 'PgDn', size: 1, row: 1, col: 18.5 },
  ];
  return [...base75, ...navCluster];
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
