import * as THREE from 'three';

/**
 * 3D Sculpted Artisan Figurine Builders for Keycap Rubik's Cube
 * Hyper-realistic, high-performance procedural Three.js meshes with tactile PBR aesthetics.
 * Matches user reference image for visible faces, and adds requested themed mixes:
 * Makanan, Hewan, Hal Lucu, Hal Seram, Boneka, Tanaman, Gunung, Api, Alam & Kristal.
 */

// Shared PBR Materials Cache for maximum 60fps WebGL rendering performance
export const MATS = {
  // Base Clay & Housings
  boneHousing: new THREE.MeshStandardMaterial({ color: 0xFFFDF8, roughness: 0.65, metalness: 0.04 }),
  darkSlate: new THREE.MeshStandardMaterial({ color: 0x1E2024, roughness: 0.72, metalness: 0.06 }),
  warmBrown: new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.65, metalness: 0.04 }),
  terracotta: new THREE.MeshStandardMaterial({ color: 0xEE964B, roughness: 0.68, metalness: 0.03 }),
  riceWhite: new THREE.MeshStandardMaterial({ color: 0xFCFCF9, roughness: 0.55, metalness: 0.02 }),
  pureWhite: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.48, metalness: 0.02 }),
  shadowBlack: new THREE.MeshStandardMaterial({ color: 0x090B0E, roughness: 0.85, metalness: 0.05 }),

  // Vibrant Foods & Accents
  salmonGloss: new THREE.MeshStandardMaterial({ color: 0xF95738, roughness: 0.28, metalness: 0.08 }),
  salmonStripe: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.38, metalness: 0.02 }),
  ramenNoodle: new THREE.MeshStandardMaterial({ color: 0xF4D35E, roughness: 0.45, metalness: 0.05 }),
  eggWhite: new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4, metalness: 0.02 }),
  eggYolk: new THREE.MeshStandardMaterial({ color: 0xFFA200, roughness: 0.25, metalness: 0.06 }),
  chashuRed: new THREE.MeshStandardMaterial({ color: 0x9B2226, roughness: 0.52, metalness: 0.05 }),
  chashuFat: new THREE.MeshStandardMaterial({ color: 0xF8EDEB, roughness: 0.45, metalness: 0.03 }),
  scallionGreen: new THREE.MeshStandardMaterial({ color: 0x2D6A4F, roughness: 0.58, metalness: 0.05 }),
  ramenBroth: new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.22, metalness: 0.1 }),

  // Nature, Plants & Kawaii Animals
  frogGreen: new THREE.MeshStandardMaterial({ color: 0x74C69D, roughness: 0.52, metalness: 0.04 }),
  bambooGreen: new THREE.MeshStandardMaterial({ color: 0x52B788, roughness: 0.58, metalness: 0.05 }),
  cactusGreen: new THREE.MeshStandardMaterial({ color: 0x40916C, roughness: 0.62, metalness: 0.03 }),
  rosePink: new THREE.MeshStandardMaterial({ color: 0xEE6C4D, roughness: 0.55, metalness: 0.04 }),
  blushPink: new THREE.MeshStandardMaterial({ color: 0xFFB4A2, roughness: 0.6, metalness: 0.02 }),
  bearBrown: new THREE.MeshStandardMaterial({ color: 0x9C6644, roughness: 0.68, metalness: 0.04 }),
  mushroomCap: new THREE.MeshStandardMaterial({ color: 0x8B5E3C, roughness: 0.62, metalness: 0.03 }),
  mushroomStem: new THREE.MeshStandardMaterial({ color: 0xF5EBE0, roughness: 0.58, metalness: 0.02 }),
  flowerYellow: new THREE.MeshStandardMaterial({ color: 0xF4D35E, roughness: 0.45, metalness: 0.05 }),
  flowerCenter: new THREE.MeshStandardMaterial({ color: 0x6B4F35, roughness: 0.6, metalness: 0.03 }),

  // Bakery, Donut & Pizza
  donutDough: new THREE.MeshStandardMaterial({ color: 0xDDA15E, roughness: 0.62, metalness: 0.04 }),
  donutGlaze: new THREE.MeshStandardMaterial({ color: 0xFF70A6, roughness: 0.24, metalness: 0.06 }),
  sprinkleBlue: new THREE.MeshStandardMaterial({ color: 0x48CAE4, roughness: 0.35, metalness: 0.05 }),
  sprinkleYellow: new THREE.MeshStandardMaterial({ color: 0xFFD166, roughness: 0.35, metalness: 0.05 }),
  sprinkleWhite: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.35, metalness: 0.05 }),
  pizzaCrust: new THREE.MeshStandardMaterial({ color: 0xCB997E, roughness: 0.65, metalness: 0.03 }),
  pizzaCheese: new THREE.MeshStandardMaterial({ color: 0xFFD166, roughness: 0.38, metalness: 0.06 }),
  pizzaPepperoni: new THREE.MeshStandardMaterial({ color: 0xA4161A, roughness: 0.48, metalness: 0.05 }),
  croissantGold: new THREE.MeshStandardMaterial({ color: 0xD4A373, roughness: 0.55, metalness: 0.05 }),

  // Drinks (Boba)
  bobaCup: new THREE.MeshStandardMaterial({ color: 0xE8F4F8, roughness: 0.15, metalness: 0.08, transparent: true, opacity: 0.85 }),
  bobaTea: new THREE.MeshStandardMaterial({ color: 0xC89F7D, roughness: 0.35, metalness: 0.05 }),
  bobaPearl: new THREE.MeshStandardMaterial({ color: 0x1A1412, roughness: 0.22, metalness: 0.12 }),
  strawRed: new THREE.MeshStandardMaterial({ color: 0xE63946, roughness: 0.3, metalness: 0.05 }),

  // Ocean, Night & Gold
  waveDeepBlue: new THREE.MeshStandardMaterial({ color: 0x0D3B66, roughness: 0.38, metalness: 0.1 }),
  waveMidBlue: new THREE.MeshStandardMaterial({ color: 0x457B9D, roughness: 0.42, metalness: 0.08 }),
  waveFoam: new THREE.MeshStandardMaterial({ color: 0xF8F9FA, roughness: 0.52, metalness: 0.02 }),
  nightViolet: new THREE.MeshStandardMaterial({ color: 0x1E0D36, roughness: 0.68, metalness: 0.12 }),
  giltGold: new THREE.MeshStandardMaterial({ color: 0xF4D35E, roughness: 0.24, metalness: 0.88 }),

  // Spooky & Halloween
  pumpkinOrange: new THREE.MeshStandardMaterial({ color: 0xEE7B30, roughness: 0.58, metalness: 0.04 }),
  pumpkinStem: new THREE.MeshStandardMaterial({ color: 0x2D6A4F, roughness: 0.65, metalness: 0.04 }),
  pumpkinCarve: new THREE.MeshStandardMaterial({ color: 0x2B1810, roughness: 0.8, metalness: 0.05 }),
  screamBone: new THREE.MeshStandardMaterial({ color: 0xF8F9FA, roughness: 0.5, metalness: 0.02 }),
  ghostWhite: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.45, metalness: 0.02 }),
  skullBone: new THREE.MeshStandardMaterial({ color: 0xEDEDE9, roughness: 0.62, metalness: 0.04 }),
  batBlack: new THREE.MeshStandardMaterial({ color: 0x1A181B, roughness: 0.72, metalness: 0.05 }),
  eyeballIris: new THREE.MeshStandardMaterial({ color: 0x0077B6, roughness: 0.25, metalness: 0.1 }),
  eyeballVein: new THREE.MeshStandardMaterial({ color: 0xBA181B, roughness: 0.5, metalness: 0.02 }),

  // Gunung & Api (Mountains & Fire)
  fujiBase: new THREE.MeshStandardMaterial({ color: 0x274060, roughness: 0.65, metalness: 0.06 }),
  fujiSnow: new THREE.MeshStandardMaterial({ color: 0xFAFDFF, roughness: 0.4, metalness: 0.02 }),
  volcanoRock: new THREE.MeshStandardMaterial({ color: 0x2B2726, roughness: 0.78, metalness: 0.05 }),
  volcanoLava: new THREE.MeshStandardMaterial({ color: 0xFF3600, roughness: 0.28, metalness: 0.15, emissive: new THREE.Color(0xFF2200), emissiveIntensity: 0.6 }),
  flameOrange: new THREE.MeshStandardMaterial({ color: 0xFF5400, roughness: 0.3, metalness: 0.05, emissive: new THREE.Color(0xFF4500), emissiveIntensity: 0.5 }),
  flameYellow: new THREE.MeshStandardMaterial({ color: 0xFFD000, roughness: 0.25, metalness: 0.05, emissive: new THREE.Color(0xFFB703), emissiveIntensity: 0.7 }),
  woodLog: new THREE.MeshStandardMaterial({ color: 0x4A2810, roughness: 0.75, metalness: 0.04 }),

  // Boneka, Hewan & Kristal
  voodooBurlap: new THREE.MeshStandardMaterial({ color: 0xB79CED, roughness: 0.75, metalness: 0.04 }),
  voodooPatch: new THREE.MeshStandardMaterial({ color: 0xE76F51, roughness: 0.68, metalness: 0.03 }),
  robotSilver: new THREE.MeshStandardMaterial({ color: 0xA8B2B7, roughness: 0.35, metalness: 0.82 }),
  robotGlow: new THREE.MeshStandardMaterial({ color: 0x48CAE4, roughness: 0.2, metalness: 0.1, emissive: new THREE.Color(0x00B4D8), emissiveIntensity: 0.8 }),
  duckYellow: new THREE.MeshStandardMaterial({ color: 0xFFD000, roughness: 0.42, metalness: 0.04 }),
  duckBeak: new THREE.MeshStandardMaterial({ color: 0xFB8500, roughness: 0.5, metalness: 0.04 }),
  axolotlPink: new THREE.MeshStandardMaterial({ color: 0xFFC8DD, roughness: 0.52, metalness: 0.03 }),
  axolotlFrill: new THREE.MeshStandardMaterial({ color: 0xFF4D6D, roughness: 0.48, metalness: 0.05 }),
  shibaTan: new THREE.MeshStandardMaterial({ color: 0xE09F3E, roughness: 0.65, metalness: 0.04 }),
  bonsaiTrunk: new THREE.MeshStandardMaterial({ color: 0x58311B, roughness: 0.75, metalness: 0.04 }),
  bonsaiFoliage: new THREE.MeshStandardMaterial({ color: 0x2B580C, roughness: 0.65, metalness: 0.04 }),
  amethystCrystal: new THREE.MeshStandardMaterial({ color: 0x7209B7, roughness: 0.2, metalness: 0.35, transparent: true, opacity: 0.92 }),
  succulentMint: new THREE.MeshStandardMaterial({ color: 0x90BE6D, roughness: 0.58, metalness: 0.03 }),
};

function addShadows(group: THREE.Group): THREE.Group {
  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return group;
}

// ============================================================================
// 1. FRONT FACE ARTISANS (Exact match to reference image)
// ============================================================================

// 1.1 Chibi Neko Cat
export function buildCatArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  const headGeo = new THREE.SphereGeometry(3.6 * scale, 20, 20);
  const head = new THREE.Mesh(headGeo, MATS.riceWhite);
  head.scale.set(1.12, 0.95, 0.72);
  head.position.set(0, 0, 1.8 * scale);
  g.add(head);

  // Calico spot patch on head
  const patchGeo = new THREE.SphereGeometry(1.5 * scale, 12, 12);
  const patch = new THREE.Mesh(patchGeo, MATS.shibaTan);
  patch.position.set(-1.6 * scale, 1.8 * scale, 2.8 * scale);
  g.add(patch);

  // Ears
  const earGeo = new THREE.ConeGeometry(1.3 * scale, 2.2 * scale, 4);
  const earL = new THREE.Mesh(earGeo, MATS.shibaTan);
  earL.position.set(-2.5 * scale, 2.6 * scale, 1.4 * scale);
  earL.rotation.set(-0.2, 0, 0.4);
  g.add(earL);

  const earR = new THREE.Mesh(earGeo, MATS.riceWhite);
  earR.position.set(2.5 * scale, 2.6 * scale, 1.4 * scale);
  earR.rotation.set(-0.2, 0, -0.4);
  g.add(earR);

  // Pink Inner Ears
  const inGeo = new THREE.ConeGeometry(0.7 * scale, 1.4 * scale, 4);
  const inL = new THREE.Mesh(inGeo, MATS.blushPink);
  inL.position.set(-2.4 * scale, 2.5 * scale, 1.8 * scale);
  inL.rotation.set(-0.2, 0, 0.4);
  g.add(inL);

  const inR = inL.clone();
  inR.position.set(2.4 * scale, 2.5 * scale, 1.8 * scale);
  inR.rotation.set(-0.2, 0, -0.4);
  g.add(inR);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.38 * scale, 10, 10);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.shadowBlack);
  eyeL.position.set(-1.4 * scale, 0.2 * scale, 3.8 * scale);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.set(1.4 * scale, 0.2 * scale, 3.8 * scale);
  g.add(eyeR);

  // Nose & Whiskers
  const noseGeo = new THREE.SphereGeometry(0.25 * scale, 8, 8);
  const nose = new THREE.Mesh(noseGeo, MATS.blushPink);
  nose.position.set(0, -0.2 * scale, 4.0 * scale);
  g.add(nose);

  const blushGeo = new THREE.SphereGeometry(0.55 * scale, 8, 8);
  const blushL = new THREE.Mesh(blushGeo, MATS.blushPink);
  blushL.scale.set(1, 0.5, 0.3);
  blushL.position.set(-2.2 * scale, -0.1 * scale, 3.4 * scale);
  g.add(blushL);

  const blushR = blushL.clone();
  blushR.position.set(2.2 * scale, -0.1 * scale, 3.4 * scale);
  g.add(blushR);

  return addShadows(g);
}

// 1.2 Salmon Nigiri Sushi
export function buildSushiArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Textured Rice Bed (cluster of rice grains)
  const riceBaseGeo = new THREE.BoxGeometry(6.6 * scale, 4.2 * scale, 2.0 * scale);
  const riceBase = new THREE.Mesh(riceBaseGeo, MATS.riceWhite);
  riceBase.position.set(0, 0, 1.0 * scale);
  g.add(riceBase);

  // Rice grains on edge
  for (let i = -3; i <= 3; i += 1.4) {
    const grainGeo = new THREE.SphereGeometry(0.55 * scale, 8, 8);
    grainGeo.scale(1, 0.7, 1.2);
    const grainT = new THREE.Mesh(grainGeo, MATS.riceWhite);
    grainT.position.set(i * scale, 2.1 * scale, 1.2 * scale);
    g.add(grainT);
    const grainB = grainT.clone();
    grainB.position.set(i * scale, -2.1 * scale, 1.2 * scale);
    g.add(grainB);
  }

  // Glossy Salmon Fillet
  const salmonGeo = new THREE.BoxGeometry(7.2 * scale, 4.6 * scale, 1.6 * scale);
  const salmon = new THREE.Mesh(salmonGeo, MATS.salmonGloss);
  salmon.position.set(0, 0, 2.5 * scale);
  salmon.scale.set(1.05, 1.0, 1.2);
  g.add(salmon);

  // Diagonal White Fat Stripes
  for (let i = -2; i <= 2; i++) {
    const stripeGeo = new THREE.BoxGeometry(0.35 * scale, 5.0 * scale, 0.25 * scale);
    const stripe = new THREE.Mesh(stripeGeo, MATS.salmonStripe);
    stripe.position.set(i * 1.5 * scale, 0, 3.4 * scale);
    stripe.rotation.set(0, 0, 0.45);
    g.add(stripe);
  }

  return addShadows(g);
}

// 1.3 Friendly Ghost
export function buildGhostArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Head
  const headGeo = new THREE.SphereGeometry(3.0 * scale, 20, 20);
  const head = new THREE.Mesh(headGeo, MATS.ghostWhite);
  head.position.set(0, 0.8 * scale, 1.8 * scale);
  g.add(head);

  // Flowing Body
  const bodyGeo = new THREE.CylinderGeometry(3.0 * scale, 3.4 * scale, 3.6 * scale, 20);
  const body = new THREE.Mesh(bodyGeo, MATS.ghostWhite);
  body.position.set(0, -1.0 * scale, 1.6 * scale);
  g.add(body);

  // Waving Arms
  const armGeo = new THREE.SphereGeometry(0.85 * scale, 12, 12);
  armGeo.scale(1.8, 0.9, 0.9);
  const armL = new THREE.Mesh(armGeo, MATS.ghostWhite);
  armL.position.set(-3.2 * scale, 0.1 * scale, 2.2 * scale);
  armL.rotation.set(0, 0, 0.35);
  g.add(armL);

  const armR = new THREE.Mesh(armGeo, MATS.ghostWhite);
  armR.position.set(3.2 * scale, 0.1 * scale, 2.2 * scale);
  armR.rotation.set(0, 0, -0.35);
  g.add(armR);

  // Happy Eyes & Smile
  const eyeGeo = new THREE.SphereGeometry(0.35 * scale, 10, 10);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.shadowBlack);
  eyeL.position.set(-1.0 * scale, 1.0 * scale, 4.4 * scale);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.set(1.0 * scale, 1.0 * scale, 4.4 * scale);
  g.add(eyeR);

  // Cute Smile Curve
  const smileGeo = new THREE.TorusGeometry(0.6 * scale, 0.15 * scale, 8, 16, Math.PI);
  const smile = new THREE.Mesh(smileGeo, MATS.shadowBlack);
  smile.position.set(0, 0.4 * scale, 4.4 * scale);
  smile.rotation.set(0, 0, Math.PI);
  g.add(smile);

  return addShadows(g);
}

// 1.4 Chibi Panda holding Bamboo
export function buildPandaArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Head
  const headGeo = new THREE.SphereGeometry(3.4 * scale, 20, 20);
  const head = new THREE.Mesh(headGeo, MATS.riceWhite);
  head.scale.set(1.1, 0.95, 0.8);
  head.position.set(0, 0.4 * scale, 1.8 * scale);
  g.add(head);

  // Black Ears
  const earGeo = new THREE.SphereGeometry(1.2 * scale, 12, 12);
  const earL = new THREE.Mesh(earGeo, MATS.shadowBlack);
  earL.position.set(-2.8 * scale, 3.0 * scale, 1.6 * scale);
  g.add(earL);

  const earR = earL.clone();
  earR.position.set(2.8 * scale, 3.0 * scale, 1.6 * scale);
  g.add(earR);

  // Eye Patches
  const patchGeo = new THREE.SphereGeometry(1.1 * scale, 12, 12);
  patchGeo.scale(1.2, 0.85, 0.4);
  const patchL = new THREE.Mesh(patchGeo, MATS.shadowBlack);
  patchL.position.set(-1.4 * scale, 0.6 * scale, 3.8 * scale);
  patchL.rotation.set(0, 0, 0.35);
  g.add(patchL);

  const patchR = patchL.clone();
  patchR.position.set(1.4 * scale, 0.6 * scale, 3.8 * scale);
  patchR.rotation.set(0, 0, -0.35);
  g.add(patchR);

  // Eyes (white gleam)
  const pupilGeo = new THREE.SphereGeometry(0.25 * scale, 8, 8);
  const pupL = new THREE.Mesh(pupilGeo, MATS.pureWhite);
  pupL.position.set(-1.4 * scale, 0.8 * scale, 4.3 * scale);
  g.add(pupL);
  const pupR = pupL.clone();
  pupR.position.set(1.4 * scale, 0.8 * scale, 4.3 * scale);
  g.add(pupR);

  // Body & Bamboo
  const bodyGeo = new THREE.SphereGeometry(2.4 * scale, 16, 16);
  const body = new THREE.Mesh(bodyGeo, MATS.riceWhite);
  body.position.set(0, -2.4 * scale, 1.4 * scale);
  g.add(body);

  // Bamboo Stalk
  const bambooGeo = new THREE.CylinderGeometry(0.45 * scale, 0.45 * scale, 6.0 * scale, 10);
  const bamboo = new THREE.Mesh(bambooGeo, MATS.bambooGreen);
  bamboo.position.set(2.2 * scale, -0.8 * scale, 3.2 * scale);
  bamboo.rotation.set(0.2, 0, -0.3);
  g.add(bamboo);

  return addShadows(g);
}

// 1.5 Authentic Tonkotsu Ramen Bowl
export function buildRamenArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Ceramic Bowl
  const bowlGeo = new THREE.CylinderGeometry(3.8 * scale, 2.2 * scale, 2.4 * scale, 24);
  const bowl = new THREE.Mesh(bowlGeo, MATS.darkSlate);
  bowl.position.set(0, 0, 1.2 * scale);
  bowl.rotation.set(Math.PI / 2, 0, 0);
  g.add(bowl);

  // White Ceramic Rim
  const rimGeo = new THREE.TorusGeometry(3.8 * scale, 0.25 * scale, 8, 24);
  const rim = new THREE.Mesh(rimGeo, MATS.pureWhite);
  rim.position.set(0, 0, 2.4 * scale);
  g.add(rim);

  // Rich Broth
  const brothGeo = new THREE.CircleGeometry(3.6 * scale, 24);
  const broth = new THREE.Mesh(brothGeo, MATS.ramenBroth);
  broth.position.set(0, 0, 2.3 * scale);
  g.add(broth);

  // Curled Ramen Noodles
  for (let i = 0; i < 4; i++) {
    const noodleGeo = new THREE.TorusGeometry((1.6 + i * 0.4) * scale, 0.22 * scale, 6, 16, Math.PI * 1.4);
    const noodle = new THREE.Mesh(noodleGeo, MATS.ramenNoodle);
    noodle.position.set(-0.2 * scale, -0.3 * scale, (2.4 + i * 0.1) * scale);
    noodle.rotation.set(0, 0, i * 0.8);
    g.add(noodle);
  }

  // Boiled Ajitsuke Egg Half
  const eggWhiteGeo = new THREE.SphereGeometry(1.2 * scale, 12, 12);
  eggWhiteGeo.scale(1.2, 0.9, 0.5);
  const eggW = new THREE.Mesh(eggWhiteGeo, MATS.eggWhite);
  eggW.position.set(1.4 * scale, 0.8 * scale, 2.6 * scale);
  g.add(eggW);

  const eggYolkGeo = new THREE.SphereGeometry(0.65 * scale, 10, 10);
  const eggY = new THREE.Mesh(eggYolkGeo, MATS.eggYolk);
  eggY.position.set(1.4 * scale, 0.8 * scale, 2.9 * scale);
  g.add(eggY);

  // Chashu Pork Slices (two slices)
  const chashuGeo = new THREE.CylinderGeometry(1.4 * scale, 1.4 * scale, 0.25 * scale, 12);
  const chashu1 = new THREE.Mesh(chashuGeo, MATS.chashuRed);
  chashu1.position.set(-1.4 * scale, 0.9 * scale, 2.6 * scale);
  chashu1.rotation.set(Math.PI / 2, 0, 0.3);
  g.add(chashu1);

  const chashu2 = chashu1.clone();
  chashu2.position.set(-1.8 * scale, -0.4 * scale, 2.7 * scale);
  g.add(chashu2);

  // Scallion Green Garnish
  for (let s = 0; s < 5; s++) {
    const scGeo = new THREE.TorusGeometry(0.3 * scale, 0.1 * scale, 4, 8);
    const sc = new THREE.Mesh(scGeo, MATS.scallionGreen);
    sc.position.set((Math.random() - 0.5) * 1.5 * scale, (Math.random() - 0.5) * 1.5 * scale, 2.8 * scale);
    g.add(sc);
  }

  return addShadows(g);
}

// 1.6 The Great Wave of Kanagawa
export function buildWaveArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Deep Ocean Base
  const baseGeo = new THREE.BoxGeometry(7.0 * scale, 7.0 * scale, 1.2 * scale);
  const base = new THREE.Mesh(baseGeo, MATS.waveDeepBlue);
  base.position.set(0, 0, 0.6 * scale);
  g.add(base);

  // Curved Crest of the Wave
  const waveCurve = new THREE.TorusGeometry(2.8 * scale, 1.2 * scale, 12, 24, Math.PI * 1.2);
  const wave = new THREE.Mesh(waveCurve, MATS.waveMidBlue);
  wave.position.set(0.4 * scale, -0.6 * scale, 1.8 * scale);
  wave.rotation.set(0, 0, -0.4);
  g.add(wave);

  // White Foam Tops (crests)
  for (let f = 0; f < 8; f++) {
    const foamGeo = new THREE.SphereGeometry((0.55 + Math.random() * 0.3) * scale, 8, 8);
    const foam = new THREE.Mesh(foamGeo, MATS.waveFoam);
    const ang = -0.4 + (f / 8) * Math.PI * 1.2;
    foam.position.set(
      (0.4 + Math.cos(ang) * 2.8) * scale,
      (-0.6 + Math.sin(ang) * 2.8) * scale,
      2.8 * scale
    );
    g.add(foam);
  }

  return addShadows(g);
}

// 1.7 Scream / Ghostface Mask
export function buildScreamArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Elongated White Mask
  const maskGeo = new THREE.SphereGeometry(3.0 * scale, 20, 20);
  maskGeo.scale(0.85, 1.45, 0.7);
  const mask = new THREE.Mesh(maskGeo, MATS.screamBone);
  mask.position.set(0, 0, 1.8 * scale);
  g.add(mask);

  // Hollow Drooping Eyes
  const eyeGeo = new THREE.ConeGeometry(0.75 * scale, 1.8 * scale, 8);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.shadowBlack);
  eyeL.position.set(-1.1 * scale, 0.9 * scale, 3.4 * scale);
  eyeL.rotation.set(0.4, 0, 0.3);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.set(1.1 * scale, 0.9 * scale, 3.4 * scale);
  eyeR.rotation.set(0.4, 0, -0.3);
  g.add(eyeR);

  // Gaping Scream Mouth
  const mouthGeo = new THREE.CylinderGeometry(0.65 * scale, 0.75 * scale, 2.6 * scale, 12);
  const mouth = new THREE.Mesh(mouthGeo, MATS.shadowBlack);
  mouth.position.set(0, -1.4 * scale, 3.2 * scale);
  mouth.rotation.set(0.2, 0, 0);
  g.add(mouth);

  return addShadows(g);
}

// 1.8 Jack-o'-Lantern Halloween Pumpkin
export function buildPumpkinArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Ribbed Pumpkin Body (6 intersecting spheres)
  for (let r = 0; r < 6; r++) {
    const ribGeo = new THREE.SphereGeometry(2.4 * scale, 14, 14);
    ribGeo.scale(0.65, 1.0, 1.05);
    const rib = new THREE.Mesh(ribGeo, MATS.pumpkinOrange);
    rib.position.set(0, 0, 1.8 * scale);
    rib.rotation.set(0, 0, (r * Math.PI) / 3);
    g.add(rib);
  }

  // Curved Stem
  const stemGeo = new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 1.6 * scale, 8);
  const stem = new THREE.Mesh(stemGeo, MATS.pumpkinStem);
  stem.position.set(0, 2.6 * scale, 1.8 * scale);
  stem.rotation.set(0.2, 0, 0.3);
  g.add(stem);

  // Carved Sinister Eyes
  const eyeGeo = new THREE.ConeGeometry(0.55 * scale, 0.9 * scale, 3);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.pumpkinCarve);
  eyeL.position.set(-1.0 * scale, 0.6 * scale, 3.8 * scale);
  eyeL.rotation.set(0, 0, Math.PI);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.set(1.0 * scale, 0.6 * scale, 3.8 * scale);
  eyeR.rotation.set(0, 0, Math.PI);
  g.add(eyeR);

  // Carved Jagged Smile
  const mouthGeo = new THREE.BoxGeometry(2.6 * scale, 0.5 * scale, 0.8 * scale);
  const mouth = new THREE.Mesh(mouthGeo, MATS.pumpkinCarve);
  mouth.position.set(0, -0.7 * scale, 3.8 * scale);
  g.add(mouth);

  return addShadows(g);
}

// 1.9 Starry Night Celestial Tile
export function buildStarryNightArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Midnight Violet Tile Base
  const baseGeo = new THREE.BoxGeometry(7.0 * scale, 7.0 * scale, 1.4 * scale);
  const base = new THREE.Mesh(baseGeo, MATS.nightViolet);
  base.position.set(0, 0, 0.7 * scale);
  g.add(base);

  // Golden Crescent Moon
  const moonOuterGeo = new THREE.CylinderGeometry(2.0 * scale, 2.0 * scale, 0.6 * scale, 24);
  const moon = new THREE.Mesh(moonOuterGeo, MATS.giltGold);
  moon.position.set(-0.8 * scale, 0.8 * scale, 1.6 * scale);
  moon.rotation.set(Math.PI / 2, 0, 0);
  g.add(moon);

  // Mountain Hills at bottom
  const hillGeo = new THREE.SphereGeometry(2.8 * scale, 12, 12);
  const hill1 = new THREE.Mesh(hillGeo, MATS.waveDeepBlue);
  hill1.position.set(-2.0 * scale, -3.2 * scale, 1.4 * scale);
  g.add(hill1);

  const hill2 = hill1.clone();
  hill2.position.set(2.0 * scale, -3.4 * scale, 1.4 * scale);
  g.add(hill2);

  // Twinkling Golden Stars & Gilt Leaves
  for (let s = 0; s < 7; s++) {
    const starGeo = new THREE.SphereGeometry(0.35 * scale, 6, 6);
    const star = new THREE.Mesh(starGeo, MATS.giltGold);
    star.position.set((-2.5 + (s % 3) * 2.2) * scale, (0.2 + (s % 2) * 2.0) * scale, 1.8 * scale);
    g.add(star);
  }

  return addShadows(g);
}

// ============================================================================
// 2. TOP & RIGHT ARTISANS (Rose, Frog, Bear, Cactus, Mushroom, Donut, etc.)
// ============================================================================

// 2.1 Sculpted Pink Rose
export function buildRoseArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Spiral Rose Petals
  for (let layer = 0; layer < 4; layer++) {
    const count = 4 + layer * 2;
    const rad = (1.0 + layer * 0.75) * scale;
    for (let p = 0; p < count; p++) {
      const petalGeo = new THREE.SphereGeometry(1.1 * scale, 8, 8);
      petalGeo.scale(1.2, 0.6, 1.4);
      const petal = new THREE.Mesh(petalGeo, MATS.rosePink);
      const ang = (p / count) * Math.PI * 2 + layer * 0.4;
      petal.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, (2.6 - layer * 0.45) * scale);
      petal.rotation.set(Math.sin(ang) * 0.4, -Math.cos(ang) * 0.4, ang);
      g.add(petal);
    }
  }

  return addShadows(g);
}

// 2.2 Kawaii Green Tree Frog
export function buildFrogArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Chubby Frog Body
  const bodyGeo = new THREE.SphereGeometry(3.6 * scale, 20, 20);
  bodyGeo.scale(1.2, 0.9, 0.85);
  const body = new THREE.Mesh(bodyGeo, MATS.frogGreen);
  body.position.set(0, 0, 1.8 * scale);
  g.add(body);

  // Big Bulging Eyes on top
  const eyeSocketGeo = new THREE.SphereGeometry(1.2 * scale, 14, 14);
  const sockL = new THREE.Mesh(eyeSocketGeo, MATS.frogGreen);
  sockL.position.set(-1.8 * scale, 2.0 * scale, 2.6 * scale);
  g.add(sockL);

  const sockR = sockL.clone();
  sockR.position.set(1.8 * scale, 2.0 * scale, 2.6 * scale);
  g.add(sockR);

  // Black pupils & white reflection
  const pupGeo = new THREE.SphereGeometry(0.55 * scale, 10, 10);
  const pupL = new THREE.Mesh(pupGeo, MATS.shadowBlack);
  pupL.position.set(-1.8 * scale, 2.2 * scale, 3.4 * scale);
  g.add(pupL);

  const pupR = pupL.clone();
  pupR.position.set(1.8 * scale, 2.2 * scale, 3.4 * scale);
  g.add(pupR);

  // Cheek blush
  const blushGeo = new THREE.SphereGeometry(0.55 * scale, 8, 8);
  const blL = new THREE.Mesh(blushGeo, MATS.blushPink);
  blL.scale.set(1, 0.6, 0.3);
  blL.position.set(-2.2 * scale, -0.4 * scale, 3.2 * scale);
  g.add(blL);
  const blR = blL.clone();
  blR.position.set(2.2 * scale, -0.4 * scale, 3.2 * scale);
  g.add(blR);

  return addShadows(g);
}

// 2.3 Rainbow Petal Daisy
export function buildFlowerArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  const colors = [0xFF595E, 0xFFCA3A, 0x8AC926, 0x1982C4, 0x6A4C93, 0xFF924C, 0x52B788, 0xE0AAFF];
  for (let i = 0; i < 8; i++) {
    const petalGeo = new THREE.CylinderGeometry(0.6 * scale, 0.8 * scale, 2.2 * scale, 10);
    const petalMat = new THREE.MeshStandardMaterial({ color: colors[i] ?? 0xFF595E, roughness: 0.5, metalness: 0.04 });
    const petal = new THREE.Mesh(petalGeo, petalMat);
    const ang = (i / 8) * Math.PI * 2;
    petal.position.set(Math.cos(ang) * 2.4 * scale, Math.sin(ang) * 2.4 * scale, 1.8 * scale);
    petal.rotation.set(0, 0, ang - Math.PI / 2);
    g.add(petal);
  }

  const centerGeo = new THREE.SphereGeometry(1.4 * scale, 16, 16);
  const center = new THREE.Mesh(centerGeo, MATS.flowerYellow);
  center.position.set(0, 0, 2.2 * scale);
  g.add(center);

  return addShadows(g);
}

// 2.4 Cute Teddy Bear
export function buildBearArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Head
  const headGeo = new THREE.SphereGeometry(3.2 * scale, 18, 18);
  headGeo.scale(1.05, 0.95, 0.85);
  const head = new THREE.Mesh(headGeo, MATS.bearBrown);
  head.position.set(0, 0.4 * scale, 1.8 * scale);
  g.add(head);

  // Round Ears
  const earGeo = new THREE.SphereGeometry(1.1 * scale, 12, 12);
  const earL = new THREE.Mesh(earGeo, MATS.bearBrown);
  earL.position.set(-2.4 * scale, 2.8 * scale, 1.6 * scale);
  g.add(earL);

  const earR = earL.clone();
  earR.position.set(2.4 * scale, 2.8 * scale, 1.6 * scale);
  g.add(earR);

  // Snout
  const snoutGeo = new THREE.SphereGeometry(1.2 * scale, 12, 12);
  snoutGeo.scale(1.2, 0.9, 0.6);
  const snout = new THREE.Mesh(snoutGeo, MATS.riceWhite);
  snout.position.set(0, -0.4 * scale, 3.2 * scale);
  g.add(snout);

  const noseGeo = new THREE.SphereGeometry(0.35 * scale, 8, 8);
  const nose = new THREE.Mesh(noseGeo, MATS.shadowBlack);
  nose.position.set(0, -0.2 * scale, 3.8 * scale);
  g.add(nose);

  return addShadows(g);
}

// 2.5 Potted Cactus with Flower
export function buildCactusArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Terracotta Pot
  const potGeo = new THREE.CylinderGeometry(2.4 * scale, 1.8 * scale, 3.0 * scale, 16);
  const pot = new THREE.Mesh(potGeo, MATS.terracotta);
  pot.position.set(0, -1.8 * scale, 1.4 * scale);
  pot.rotation.set(Math.PI / 2, 0, 0);
  g.add(pot);

  // Green Ribbed Cactus
  const cactusGeo = new THREE.CylinderGeometry(1.6 * scale, 1.8 * scale, 4.0 * scale, 12);
  const cactus = new THREE.Mesh(cactusGeo, MATS.cactusGreen);
  cactus.position.set(0, 1.2 * scale, 1.8 * scale);
  cactus.rotation.set(Math.PI / 2, 0, 0);
  g.add(cactus);

  // Pink Blossom on Top
  const blossomGeo = new THREE.SphereGeometry(0.65 * scale, 8, 8);
  const blossom = new THREE.Mesh(blossomGeo, MATS.rosePink);
  blossom.position.set(0, 3.4 * scale, 1.8 * scale);
  g.add(blossom);

  return addShadows(g);
}

// 2.6 Woodland Forest Mushroom
export function buildMushroomArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Thick Pale Stem
  const stemGeo = new THREE.CylinderGeometry(1.2 * scale, 1.6 * scale, 3.4 * scale, 16);
  const stem = new THREE.Mesh(stemGeo, MATS.mushroomStem);
  stem.position.set(0, -1.2 * scale, 1.4 * scale);
  stem.rotation.set(Math.PI / 2, 0, 0);
  g.add(stem);

  // Rounded Brown Cap
  const capGeo = new THREE.SphereGeometry(3.2 * scale, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const cap = new THREE.Mesh(capGeo, MATS.mushroomCap);
  cap.position.set(0, 0.8 * scale, 1.8 * scale);
  cap.rotation.set(-Math.PI / 2, 0, 0);
  g.add(cap);

  // White Speckles on cap
  for (let s = 0; s < 6; s++) {
    const dotGeo = new THREE.SphereGeometry(0.35 * scale, 6, 6);
    const dot = new THREE.Mesh(dotGeo, MATS.pureWhite);
    dot.position.set(
      (Math.cos(s * 1.1) * 1.8) * scale,
      (Math.sin(s * 1.1) * 1.4 + 1.2) * scale,
      2.6 * scale
    );
    g.add(dot);
  }

  return addShadows(g);
}

// 2.7 Glazed Donut with Sprinkles
export function buildDonutArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Baked Dough Torus
  const doughGeo = new THREE.TorusGeometry(2.6 * scale, 1.4 * scale, 16, 32);
  const dough = new THREE.Mesh(doughGeo, MATS.donutDough);
  dough.position.set(0, 0, 1.4 * scale);
  g.add(dough);

  // Strawberry Glaze
  const glazeGeo = new THREE.TorusGeometry(2.6 * scale, 1.35 * scale, 16, 32, Math.PI * 2);
  const glaze = new THREE.Mesh(glazeGeo, MATS.donutGlaze);
  glaze.position.set(0, 0, 1.9 * scale);
  glaze.scale.set(1.02, 1.02, 0.85);
  g.add(glaze);

  // Confetti Sprinkles
  const mats = [MATS.sprinkleBlue, MATS.sprinkleYellow, MATS.sprinkleWhite];
  for (let s = 0; s < 14; s++) {
    const spGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 0.9 * scale, 6);
    const sp = new THREE.Mesh(spGeo, mats[s % mats.length]);
    const ang = (s / 14) * Math.PI * 2;
    sp.position.set(Math.cos(ang) * 2.5 * scale, Math.sin(ang) * 2.5 * scale, 2.9 * scale);
    sp.rotation.set(0, 0, ang + 0.4);
    g.add(sp);
  }

  return addShadows(g);
}

// 2.8 Midnight Panther / Creature
export function buildCreatureArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  const headGeo = new THREE.SphereGeometry(3.4 * scale, 18, 18);
  const head = new THREE.Mesh(headGeo, MATS.darkSlate);
  head.scale.set(1.1, 0.95, 0.8);
  head.position.set(0, 0, 1.8 * scale);
  g.add(head);

  const earGeo = new THREE.ConeGeometry(1.2 * scale, 2.0 * scale, 4);
  const earL = new THREE.Mesh(earGeo, MATS.darkSlate);
  earL.position.set(-2.2 * scale, 2.5 * scale, 1.6 * scale);
  earL.rotation.set(-0.2, 0, 0.4);
  g.add(earL);

  const earR = earL.clone();
  earR.position.set(2.2 * scale, 2.5 * scale, 1.6 * scale);
  earR.rotation.set(-0.2, 0, -0.4);
  g.add(earR);

  // Glowing Yellow Eyes
  const eyeGeo = new THREE.SphereGeometry(0.45 * scale, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.giltGold);
  eyeL.position.set(-1.2 * scale, 0.4 * scale, 3.6 * scale);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.set(1.2 * scale, 0.4 * scale, 3.6 * scale);
  g.add(eyeR);

  return addShadows(g);
}

// 2.9 Botanical Gilt Leaf
export function buildBotanicalLeafArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  const baseGeo = new THREE.BoxGeometry(7.0 * scale, 7.0 * scale, 1.2 * scale);
  const base = new THREE.Mesh(baseGeo, MATS.boneHousing);
  base.position.set(0, 0, 0.6 * scale);
  g.add(base);

  // Curved Stem
  const stemGeo = new THREE.CylinderGeometry(0.25 * scale, 0.25 * scale, 6.0 * scale, 8);
  const stem = new THREE.Mesh(stemGeo, MATS.giltGold);
  stem.position.set(0, 0, 1.5 * scale);
  stem.rotation.set(0, 0, 0.6);
  g.add(stem);

  // Golden Oval Leaves
  for (let i = -2; i <= 2; i++) {
    const leafGeo = new THREE.SphereGeometry(1.0 * scale, 8, 8);
    leafGeo.scale(1.5, 0.7, 0.35);
    const leafL = new THREE.Mesh(leafGeo, MATS.giltGold);
    leafL.position.set((-1.2 + i * 0.5) * scale, (i * 1.2) * scale, 1.6 * scale);
    leafL.rotation.set(0, 0, 0.8);
    g.add(leafL);

    const leafR = leafL.clone();
    leafR.position.set((1.2 + i * 0.5) * scale, (i * 1.2) * scale, 1.6 * scale);
    leafR.rotation.set(0, 0, -0.4);
    g.add(leafR);
  }

  return addShadows(g);
}

// ============================================================================
// 3. NEW ARTISANS FOR HIDDEN FACES (Makanan, Hewan, Hal Seram, Gunung, Api, dll)
// ============================================================================

// 3.1 Mount Fuji Snowcap (Gunung & Alam)
export function buildMountFujiArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Indigo Mountain Cone
  const coneGeo = new THREE.ConeGeometry(3.6 * scale, 4.6 * scale, 16);
  const cone = new THREE.Mesh(coneGeo, MATS.fujiBase);
  cone.position.set(0, -0.4 * scale, 1.8 * scale);
  cone.rotation.set(Math.PI / 2, 0, 0);
  g.add(cone);

  // Snowcap Summit
  const snowGeo = new THREE.ConeGeometry(1.6 * scale, 1.8 * scale, 16);
  const snow = new THREE.Mesh(snowGeo, MATS.fujiSnow);
  snow.position.set(0, 1.2 * scale, 2.0 * scale);
  snow.rotation.set(Math.PI / 2, 0, 0);
  g.add(snow);

  return addShadows(g);
}

// 3.2 Volcano Eruption (Gunung & Api)
export function buildVolcanoArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Dark Volcanic Cone
  const rockGeo = new THREE.CylinderGeometry(1.4 * scale, 3.6 * scale, 4.0 * scale, 12);
  const rock = new THREE.Mesh(rockGeo, MATS.volcanoRock);
  rock.position.set(0, -0.6 * scale, 1.6 * scale);
  rock.rotation.set(Math.PI / 2, 0, 0);
  g.add(rock);

  // Molten Glowing Lava Crater
  const craterGeo = new THREE.CircleGeometry(1.3 * scale, 12);
  const crater = new THREE.Mesh(craterGeo, MATS.volcanoLava);
  crater.position.set(0, 1.4 * scale, 2.2 * scale);
  g.add(crater);

  // Dripping Lava Fissures
  for (let l = 0; l < 4; l++) {
    const dripGeo = new THREE.CylinderGeometry(0.25 * scale, 0.15 * scale, 2.2 * scale, 6);
    const drip = new THREE.Mesh(dripGeo, MATS.volcanoLava);
    const ang = (l / 4) * Math.PI * 2;
    drip.position.set(Math.cos(ang) * 1.8 * scale, (Math.sin(ang) * 1.8 - 0.4) * scale, 2.0 * scale);
    drip.rotation.set(Math.PI / 2, 0, ang);
    g.add(drip);
  }

  return addShadows(g);
}

// 3.3 Campfire & Roaring Flame (Api)
export function buildCampfireFlameArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Crossed Wood Logs
  for (let w = 0; w < 3; w++) {
    const logGeo = new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 4.8 * scale, 8);
    const log = new THREE.Mesh(logGeo, MATS.woodLog);
    log.position.set(0, -1.8 * scale, (1.2 + w * 0.2) * scale);
    log.rotation.set(0, 0, (w * Math.PI) / 3);
    g.add(log);
  }

  // Outer Orange Flame
  const flameGeo1 = new THREE.ConeGeometry(2.0 * scale, 4.2 * scale, 8);
  const flame1 = new THREE.Mesh(flameGeo1, MATS.flameOrange);
  flame1.position.set(0, 0.4 * scale, 2.2 * scale);
  flame1.rotation.set(Math.PI / 2, 0, 0);
  g.add(flame1);

  // Inner Bright Yellow Flame Core
  const flameGeo2 = new THREE.ConeGeometry(1.1 * scale, 2.8 * scale, 8);
  const flame2 = new THREE.Mesh(flameGeo2, MATS.flameYellow);
  flame2.position.set(0, 0.1 * scale, 2.6 * scale);
  flame2.rotation.set(Math.PI / 2, 0, 0);
  g.add(flame2);

  return addShadows(g);
}

// 3.4 Crispy Pepperoni Pizza Slice (Makanan)
export function buildPizzaArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Triangular Crust & Melted Cheese
  const shape = new THREE.Shape();
  shape.moveTo(0, 3.2 * scale);
  shape.lineTo(-2.8 * scale, -2.8 * scale);
  shape.lineTo(2.8 * scale, -2.8 * scale);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.8 * scale, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.2 * scale, bevelThickness: 0.2 * scale });
  const cheese = new THREE.Mesh(geom, MATS.pizzaCheese);
  cheese.position.set(0, 0, 1.2 * scale);
  g.add(cheese);

  // Pepperoni Slices
  const peps: [number, number][] = [[0, 1.0], [-1.2, -1.0], [1.1, -0.8]];
  for (const [px, py] of peps) {
    const pepGeo = new THREE.CylinderGeometry(0.75 * scale, 0.75 * scale, 0.2 * scale, 12);
    const pep = new THREE.Mesh(pepGeo, MATS.pizzaPepperoni);
    pep.position.set(px * scale, py * scale, 2.4 * scale);
    pep.rotation.set(Math.PI / 2, 0, 0);
    g.add(pep);
  }

  return addShadows(g);
}

// 3.5 Boba Milk Tea Cup (Makanan & Minuman)
export function buildBobaArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Cup Body
  const cupGeo = new THREE.CylinderGeometry(2.2 * scale, 1.7 * scale, 4.4 * scale, 18);
  const cup = new THREE.Mesh(cupGeo, MATS.bobaCup);
  cup.position.set(0, 0, 1.6 * scale);
  cup.rotation.set(Math.PI / 2, 0, 0);
  g.add(cup);

  // Milk Tea Liquid Inside
  const teaGeo = new THREE.CylinderGeometry(2.0 * scale, 1.6 * scale, 3.6 * scale, 16);
  const tea = new THREE.Mesh(teaGeo, MATS.bobaTea);
  tea.position.set(0, -0.3 * scale, 1.6 * scale);
  tea.rotation.set(Math.PI / 2, 0, 0);
  g.add(tea);

  // Tapioca Pearls (black pearls clustered at bottom)
  for (let p = 0; p < 8; p++) {
    const pearlGeo = new THREE.SphereGeometry(0.42 * scale, 8, 8);
    const pearl = new THREE.Mesh(pearlGeo, MATS.bobaPearl);
    pearl.position.set((Math.cos(p * 0.8) * 1.0) * scale, (-1.5 + (p % 2) * 0.4) * scale, (1.6 + Math.sin(p * 0.8) * 0.8) * scale);
    g.add(pearl);
  }

  // Straw
  const strawGeo = new THREE.CylinderGeometry(0.28 * scale, 0.28 * scale, 4.8 * scale, 8);
  const straw = new THREE.Mesh(strawGeo, MATS.strawRed);
  straw.position.set(0.6 * scale, 1.2 * scale, 2.2 * scale);
  straw.rotation.set(Math.PI / 2, 0.2, 0.2);
  g.add(straw);

  return addShadows(g);
}

// 3.6 Gothic Skull (Hal Seram)
export function buildSkullArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Cranium
  const craniumGeo = new THREE.SphereGeometry(3.0 * scale, 16, 16);
  craniumGeo.scale(1.0, 1.15, 0.9);
  const cranium = new THREE.Mesh(craniumGeo, MATS.skullBone);
  cranium.position.set(0, 0.6 * scale, 1.8 * scale);
  g.add(cranium);

  // Jaw
  const jawGeo = new THREE.BoxGeometry(2.4 * scale, 1.8 * scale, 1.6 * scale);
  const jaw = new THREE.Mesh(jawGeo, MATS.skullBone);
  jaw.position.set(0, -1.8 * scale, 1.8 * scale);
  g.add(jaw);

  // Deep Hollow Eye Sockets
  const socketGeo = new THREE.SphereGeometry(0.75 * scale, 10, 10);
  const sockL = new THREE.Mesh(socketGeo, MATS.shadowBlack);
  sockL.position.set(-1.0 * scale, 0.4 * scale, 3.4 * scale);
  g.add(sockL);

  const sockR = sockL.clone();
  sockR.position.set(1.0 * scale, 0.4 * scale, 3.4 * scale);
  g.add(sockR);

  // Inverted Heart Nose
  const noseGeo = new THREE.ConeGeometry(0.35 * scale, 0.7 * scale, 3);
  const nose = new THREE.Mesh(noseGeo, MATS.shadowBlack);
  nose.position.set(0, -0.4 * scale, 3.4 * scale);
  nose.rotation.set(0, 0, Math.PI);
  g.add(nose);

  return addShadows(g);
}

// 3.7 Spooky Bat (Hal Seram)
export function buildBatArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Cute Bat Body
  const bodyGeo = new THREE.SphereGeometry(2.2 * scale, 14, 14);
  const body = new THREE.Mesh(bodyGeo, MATS.batBlack);
  body.position.set(0, 0, 1.8 * scale);
  g.add(body);

  // Bat Ears
  const earGeo = new THREE.ConeGeometry(0.8 * scale, 1.8 * scale, 4);
  const earL = new THREE.Mesh(earGeo, MATS.batBlack);
  earL.position.set(-1.4 * scale, 2.0 * scale, 1.8 * scale);
  earL.rotation.set(-0.2, 0, 0.3);
  g.add(earL);

  const earR = earL.clone();
  earR.position.set(1.4 * scale, 2.0 * scale, 1.8 * scale);
  earR.rotation.set(-0.2, 0, -0.3);
  g.add(earR);

  // Spread Wings
  const wingGeo = new THREE.BoxGeometry(2.6 * scale, 1.6 * scale, 0.3 * scale);
  const wingL = new THREE.Mesh(wingGeo, MATS.batBlack);
  wingL.position.set(-2.8 * scale, 0.4 * scale, 1.8 * scale);
  wingL.rotation.set(0, 0.3, 0.4);
  g.add(wingL);

  const wingR = wingL.clone();
  wingR.position.set(2.8 * scale, 0.4 * scale, 1.8 * scale);
  wingR.rotation.set(0, -0.3, -0.4);
  g.add(wingR);

  // Tiny Glowing Eyes
  const eyeGeo = new THREE.SphereGeometry(0.25 * scale, 6, 6);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.pumpkinOrange);
  eyeL.position.set(-0.7 * scale, 0.4 * scale, 3.6 * scale);
  g.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.7 * scale, 0.4 * scale, 3.6 * scale);
  g.add(eyeR);

  return addShadows(g);
}

// 3.8 Creepy Eyeball (Hal Seram)
export function buildEyeballArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  const sphereGeo = new THREE.SphereGeometry(3.2 * scale, 20, 20);
  const eyeball = new THREE.Mesh(sphereGeo, MATS.pureWhite);
  eyeball.position.set(0, 0, 1.8 * scale);
  g.add(eyeball);

  // Blue Iris
  const irisGeo = new THREE.CylinderGeometry(1.6 * scale, 1.6 * scale, 0.25 * scale, 20);
  const iris = new THREE.Mesh(irisGeo, MATS.eyeballIris);
  iris.position.set(0, 0, 3.8 * scale);
  iris.rotation.set(Math.PI / 2, 0, 0);
  g.add(iris);

  // Black Pupil
  const pupGeo = new THREE.CylinderGeometry(0.8 * scale, 0.8 * scale, 0.3 * scale, 16);
  const pup = new THREE.Mesh(pupGeo, MATS.shadowBlack);
  pup.position.set(0, 0, 3.9 * scale);
  pup.rotation.set(Math.PI / 2, 0, 0);
  g.add(pup);

  return addShadows(g);
}

// 3.9 Voodoo Doll (Boneka & Hal Seram)
export function buildVoodooDollArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Ragdoll Head
  const headGeo = new THREE.SphereGeometry(2.8 * scale, 16, 16);
  const head = new THREE.Mesh(headGeo, MATS.voodooBurlap);
  head.position.set(0, 0.6 * scale, 1.8 * scale);
  g.add(head);

  // Cross Button Eye (Left)
  const btnGeo = new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, 0.25 * scale, 8);
  const btnL = new THREE.Mesh(btnGeo, MATS.darkSlate);
  btnL.position.set(-1.0 * scale, 0.8 * scale, 3.6 * scale);
  btnL.rotation.set(Math.PI / 2, 0, 0);
  g.add(btnL);

  // Red Heart Patch
  const heartGeo = new THREE.BoxGeometry(0.8 * scale, 0.8 * scale, 0.2 * scale);
  const heart = new THREE.Mesh(heartGeo, MATS.voodooPatch);
  heart.position.set(0.8 * scale, 0.6 * scale, 3.6 * scale);
  heart.rotation.set(0, 0, 0.75);
  g.add(heart);

  return addShadows(g);
}

// 3.10 Chibi Retro Robot (Boneka & Mainan)
export function buildRetroRobotArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Box Head
  const headGeo = new THREE.BoxGeometry(4.8 * scale, 4.4 * scale, 3.6 * scale);
  const head = new THREE.Mesh(headGeo, MATS.robotSilver);
  head.position.set(0, 0, 1.8 * scale);
  g.add(head);

  // Top Antenna
  const antGeo = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 1.6 * scale, 8);
  const ant = new THREE.Mesh(antGeo, MATS.robotSilver);
  ant.position.set(0, 2.8 * scale, 1.8 * scale);
  g.add(ant);

  const bulbGeo = new THREE.SphereGeometry(0.5 * scale, 8, 8);
  const bulb = new THREE.Mesh(bulbGeo, MATS.robotGlow);
  bulb.position.set(0, 3.6 * scale, 1.8 * scale);
  g.add(bulb);

  // Glowing Cyan Eyes
  const eyeGeo = new THREE.CylinderGeometry(0.6 * scale, 0.6 * scale, 0.3 * scale, 12);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.robotGlow);
  eyeL.position.set(-1.2 * scale, 0.4 * scale, 3.6 * scale);
  eyeL.rotation.set(Math.PI / 2, 0, 0);
  g.add(eyeL);

  const eyeR = eyeL.clone();
  eyeR.position.set(1.2 * scale, 0.4 * scale, 3.6 * scale);
  g.add(eyeR);

  return addShadows(g);
}

// 3.11 Cute Yellow Rubber Ducky (Hewan & Lucu)
export function buildDuckArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Duck Body
  const bodyGeo = new THREE.SphereGeometry(2.8 * scale, 16, 16);
  bodyGeo.scale(1.2, 0.9, 0.9);
  const body = new THREE.Mesh(bodyGeo, MATS.duckYellow);
  body.position.set(0, -0.8 * scale, 1.4 * scale);
  g.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(2.0 * scale, 16, 16);
  const head = new THREE.Mesh(headGeo, MATS.duckYellow);
  head.position.set(0, 1.0 * scale, 2.2 * scale);
  g.add(head);

  // Orange Beak
  const beakGeo = new THREE.ConeGeometry(0.65 * scale, 1.4 * scale, 8);
  const beak = new THREE.Mesh(beakGeo, MATS.duckBeak);
  beak.position.set(0, 0.8 * scale, 3.8 * scale);
  beak.rotation.set(Math.PI / 2, 0, 0);
  g.add(beak);

  // Tiny Eyes
  const eyeGeo = new THREE.SphereGeometry(0.25 * scale, 6, 6);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.shadowBlack);
  eyeL.position.set(-0.9 * scale, 1.4 * scale, 3.4 * scale);
  g.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.9 * scale, 1.4 * scale, 3.4 * scale);
  g.add(eyeR);

  return addShadows(g);
}

// 3.12 Kawaii Axolotl (Hewan & Lucu)
export function buildAxolotlArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Round Pink Head
  const headGeo = new THREE.SphereGeometry(3.2 * scale, 18, 18);
  headGeo.scale(1.25, 0.95, 0.75);
  const head = new THREE.Mesh(headGeo, MATS.axolotlPink);
  head.position.set(0, 0, 1.8 * scale);
  g.add(head);

  // 6 Frilly External Gills
  for (let s = -1; s <= 1; s += 2) {
    for (let f = 0; f < 3; f++) {
      const frillGeo = new THREE.CylinderGeometry(0.35 * scale, 0.15 * scale, 1.6 * scale, 6);
      const frill = new THREE.Mesh(frillGeo, MATS.axolotlFrill);
      frill.position.set((s * 3.4) * scale, (f * 1.0 - 0.4) * scale, 1.8 * scale);
      frill.rotation.set(0, 0, s * (0.6 + f * 0.3));
      g.add(frill);
    }
  }

  // Black bead eyes
  const eyeGeo = new THREE.SphereGeometry(0.35 * scale, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, MATS.shadowBlack);
  eyeL.position.set(-1.4 * scale, 0.2 * scale, 3.6 * scale);
  g.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(1.4 * scale, 0.2 * scale, 3.6 * scale);
  g.add(eyeR);

  return addShadows(g);
}

// 3.13 Shiba Inu Head (Hewan)
export function buildShibaArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  const headGeo = new THREE.SphereGeometry(3.2 * scale, 18, 18);
  headGeo.scale(1.15, 0.95, 0.8);
  const head = new THREE.Mesh(headGeo, MATS.shibaTan);
  head.position.set(0, 0, 1.8 * scale);
  g.add(head);

  // White Cheeks / Muzzle
  const muzzleGeo = new THREE.SphereGeometry(1.8 * scale, 14, 14);
  muzzleGeo.scale(1.1, 0.8, 0.6);
  const muzzle = new THREE.Mesh(muzzleGeo, MATS.riceWhite);
  muzzle.position.set(0, -0.6 * scale, 3.2 * scale);
  g.add(muzzle);

  // Black Nose
  const noseGeo = new THREE.SphereGeometry(0.4 * scale, 8, 8);
  const nose = new THREE.Mesh(noseGeo, MATS.shadowBlack);
  nose.position.set(0, -0.3 * scale, 4.0 * scale);
  g.add(nose);

  // Perked Triangle Ears
  const earGeo = new THREE.ConeGeometry(1.2 * scale, 2.0 * scale, 4);
  const earL = new THREE.Mesh(earGeo, MATS.shibaTan);
  earL.position.set(-2.2 * scale, 2.6 * scale, 1.6 * scale);
  earL.rotation.set(-0.2, 0, 0.35);
  g.add(earL);

  const earR = earL.clone();
  earR.position.set(2.2 * scale, 2.6 * scale, 1.6 * scale);
  earR.rotation.set(-0.2, 0, -0.35);
  g.add(earR);

  return addShadows(g);
}

// 3.14 Japanese Bonsai Pine (Tanaman & Alam)
export function buildBonsaiArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Pot
  const potGeo = new THREE.CylinderGeometry(2.4 * scale, 2.0 * scale, 1.4 * scale, 12);
  const pot = new THREE.Mesh(potGeo, MATS.darkSlate);
  pot.position.set(0, -2.0 * scale, 1.4 * scale);
  pot.rotation.set(Math.PI / 2, 0, 0);
  g.add(pot);

  // Twisted Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.6 * scale, 0.8 * scale, 3.4 * scale, 8);
  const trunk = new THREE.Mesh(trunkGeo, MATS.bonsaiTrunk);
  trunk.position.set(0, -0.4 * scale, 1.6 * scale);
  trunk.rotation.set(Math.PI / 2, 0.3, 0);
  g.add(trunk);

  // Cloud Pine Foliage Pads
  const pads: [number, number][] = [[-1.2, 0.8], [0.8, 1.4], [0, 2.2]];
  for (const [fx, fy] of pads) {
    const folGeo = new THREE.SphereGeometry(1.4 * scale, 12, 12);
    folGeo.scale(1.4, 0.7, 1.0);
    const fol = new THREE.Mesh(folGeo, MATS.bonsaiFoliage);
    fol.position.set(fx * scale, fy * scale, 2.2 * scale);
    g.add(fol);
  }

  return addShadows(g);
}

// 3.15 Amethyst Crystal Geode Cluster (Alam & Kristal)
export function buildCrystalArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Rock Matrix Base
  const baseGeo = new THREE.BoxGeometry(6.6 * scale, 6.6 * scale, 1.2 * scale);
  const base = new THREE.Mesh(baseGeo, MATS.volcanoRock);
  base.position.set(0, 0, 0.6 * scale);
  g.add(base);

  // Faceted Crystal Spikes
  const crystals = [
    { x: 0, y: 0, s: 2.8, rz: 0.1 },
    { x: -1.6, y: -0.8, s: 2.2, rz: -0.3 },
    { x: 1.5, y: -0.6, s: 2.0, rz: 0.4 },
    { x: -0.8, y: 1.4, s: 1.8, rz: 0.2 },
    { x: 1.2, y: 1.2, s: 1.6, rz: -0.25 },
  ];

  for (const c of crystals) {
    const prisGeo = new THREE.ConeGeometry(0.85 * scale, c.s * scale, 6);
    const pris = new THREE.Mesh(prisGeo, MATS.amethystCrystal);
    pris.position.set(c.x * scale, c.y * scale, 2.2 * scale);
    pris.rotation.set(Math.PI / 2, 0, c.rz);
    g.add(pris);
  }

  return addShadows(g);
}

// 3.16 Succulent Echeveria Rosette (Tanaman)
export function buildSucculentArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Rosette of Thick Fleshy Leaves
  for (let ring = 0; ring < 3; ring++) {
    const count = 5 + ring * 2;
    const rad = (0.9 + ring * 0.9) * scale;
    for (let p = 0; p < count; p++) {
      const leafGeo = new THREE.SphereGeometry(1.0 * scale, 8, 8);
      leafGeo.scale(1.2, 0.7, 0.4);
      const leaf = new THREE.Mesh(leafGeo, MATS.succulentMint);
      const ang = (p / count) * Math.PI * 2 + ring * 0.4;
      leaf.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, (2.6 - ring * 0.45) * scale);
      leaf.rotation.set(0, 0, ang);
      g.add(leaf);
    }
  }

  return addShadows(g);
}

// 3.17 Golden Buttery Croissant (Makanan)
export function buildCroissantArtisan(size: number): THREE.Group {
  const g = new THREE.Group();
  const scale = size / 14;

  // Curved Crescent Body
  const arcGeo = new THREE.TorusGeometry(2.4 * scale, 1.1 * scale, 12, 24, Math.PI * 0.9);
  const arc = new THREE.Mesh(arcGeo, MATS.croissantGold);
  arc.position.set(0, -0.4 * scale, 1.8 * scale);
  arc.rotation.set(0, 0, Math.PI * 0.05);
  g.add(arc);

  // Pastry Ridge Segments
  for (let i = -2; i <= 2; i++) {
    const ribGeo = new THREE.TorusGeometry(1.2 * scale, 0.22 * scale, 8, 16);
    const rib = new THREE.Mesh(ribGeo, MATS.donutDough);
    rib.position.set((i * 1.1) * scale, 0.2 * scale, 2.5 * scale);
    g.add(rib);
  }

  return addShadows(g);
}

// ============================================================================
// ARTISAN REGISTRY
// ============================================================================

export interface ArtisanDefinition {
  id: string;
  name: string;
  category: 'Front Reference' | 'Makanan' | 'Hewan & Lucu' | 'Hal Seram' | 'Boneka' | 'Gunung & Api' | 'Alam & Tanaman';
  emoji: string;
  dishColor: string;
  description?: string;
  builder: (size: number) => THREE.Group;
}

export const ARTISAN_REGISTRY = {
  // Front Reference items
  cat: { id: 'cat', name: 'Chibi Calico Cat', category: 'Front Reference', emoji: '🐱', dishColor: '#EE964B', builder: buildCatArtisan },
  sushi: { id: 'sushi', name: 'Salmon Nigiri Sushi', category: 'Front Reference', emoji: '🍣', dishColor: '#0D3B66', builder: buildSushiArtisan },
  ghost: { id: 'ghost', name: 'Friendly Ghost Boo', category: 'Front Reference', emoji: '👻', dishColor: '#071E33', builder: buildGhostArtisan },
  panda: { id: 'panda', name: 'Bamboo Chibi Panda', category: 'Front Reference', emoji: '🐼', dishColor: '#0D3B66', builder: buildPandaArtisan },
  ramen: { id: 'ramen', name: 'Tonkotsu Ramen Bowl', category: 'Front Reference', emoji: '🍜', dishColor: '#EE964B', builder: buildRamenArtisan },
  wave: { id: 'wave', name: 'Great Wave Hokusai', category: 'Front Reference', emoji: '🌊', dishColor: '#0D1B2A', builder: buildWaveArtisan },
  scream: { id: 'scream', name: 'Ghostface Scream Mask', category: 'Front Reference', emoji: '😱', dishColor: '#FAF0CA', builder: buildScreamArtisan },
  pumpkin: { id: 'pumpkin', name: "Jack-o'-Lantern Pumpkin", category: 'Front Reference', emoji: '🎃', dishColor: '#264653', builder: buildPumpkinArtisan },
  starry_night: { id: 'starry_night', name: 'Celestial Moon & Stars', category: 'Front Reference', emoji: '🌌', dishColor: '#240046', builder: buildStarryNightArtisan },

  // Top & Right Reference items
  rose: { id: 'rose', name: 'Sculpted Pink Rose', category: 'Alam & Tanaman', emoji: '🌹', dishColor: '#E9D8A6', builder: buildRoseArtisan },
  frog: { id: 'frog', name: 'Kawaii Green Tree Frog', category: 'Hewan & Lucu', emoji: '🐸', dishColor: '#F8EDEB', builder: buildFrogArtisan },
  flower: { id: 'flower', name: 'Rainbow Petal Daisy', category: 'Alam & Tanaman', emoji: '🌸', dishColor: '#C7D8E0', builder: buildFlowerArtisan },
  bear: { id: 'bear', name: 'Cute Teddy Bear', category: 'Boneka', emoji: '🧸', dishColor: '#A2D2FF', builder: buildBearArtisan },
  cactus: { id: 'cactus', name: 'Potted Succulent Cactus', category: 'Alam & Tanaman', emoji: '🌵', dishColor: '#FFDAC1', builder: buildCactusArtisan },
  mushroom: { id: 'mushroom', name: 'Woodland Forest Mushroom', category: 'Alam & Tanaman', emoji: '🍄', dishColor: '#CCD5AE', builder: buildMushroomArtisan },
  donut: { id: 'donut', name: 'Glazed Strawberry Donut', category: 'Makanan', emoji: '🍩', dishColor: '#E8D7F1', builder: buildDonutArtisan },
  creature: { id: 'creature', name: 'Midnight Panther Head', category: 'Hewan & Lucu', emoji: '🐈‍⬛', dishColor: '#1A1A1D', builder: buildCreatureArtisan },
  botanical_leaf: { id: 'botanical_leaf', name: 'Botanical Gilt Leaf', category: 'Alam & Tanaman', emoji: '🌿', dishColor: '#0D3B66', builder: buildBotanicalLeafArtisan },

  // Hidden Face Mix (Requested themes)
  fuji: { id: 'fuji', name: 'Mount Fuji Snowcap', category: 'Gunung & Api', emoji: '🗻', dishColor: '#274060', builder: buildMountFujiArtisan },
  volcano: { id: 'volcano', name: 'Volcano Lava Eruption', category: 'Gunung & Api', emoji: '🌋', dishColor: '#2B2726', builder: buildVolcanoArtisan },
  campfire: { id: 'campfire', name: 'Roaring Campfire Flame', category: 'Gunung & Api', emoji: '🔥', dishColor: '#4A2810', builder: buildCampfireFlameArtisan },
  pizza: { id: 'pizza', name: 'Crispy Pepperoni Pizza', category: 'Makanan', emoji: '🍕', dishColor: '#DDA15E', builder: buildPizzaArtisan },
  boba: { id: 'boba', name: 'Boba Milk Tea Cup', category: 'Makanan', emoji: '🧋', dishColor: '#E8F4F8', builder: buildBobaArtisan },
  croissant: { id: 'croissant', name: 'Golden Butter Croissant', category: 'Makanan', emoji: '🥐', dishColor: '#DDA15E', builder: buildCroissantArtisan },
  skull: { id: 'skull', name: 'Gothic Skull Relic', category: 'Hal Seram', emoji: '💀', dishColor: '#1E2024', builder: buildSkullArtisan },
  bat: { id: 'bat', name: 'Spooky Midnight Bat', category: 'Hal Seram', emoji: '🦇', dishColor: '#1A181B', builder: buildBatArtisan },
  eyeball: { id: 'eyeball', name: 'Creepy Bloodshot Eyeball', category: 'Hal Seram', emoji: '👁️', dishColor: '#240046', builder: buildEyeballArtisan },
  voodoo: { id: 'voodoo', name: 'Patchwork Voodoo Doll', category: 'Boneka', emoji: '🪡', dishColor: '#5C4033', builder: buildVoodooDollArtisan },
  robot: { id: 'robot', name: 'Chibi Retro Robot Head', category: 'Boneka', emoji: '🤖', dishColor: '#3D5A80', builder: buildRetroRobotArtisan },
  duck: { id: 'duck', name: 'Yellow Rubber Ducky', category: 'Hewan & Lucu', emoji: '🦆', dishColor: '#0077B6', builder: buildDuckArtisan },
  axolotl: { id: 'axolotl', name: 'Kawaii Pink Axolotl', category: 'Hewan & Lucu', emoji: '🫧', dishColor: '#FFAFCC', builder: buildAxolotlArtisan },
  shiba: { id: 'shiba', name: 'Shiba Inu Doge', category: 'Hewan & Lucu', emoji: '🐕', dishColor: '#E09F3E', builder: buildShibaArtisan },
  bonsai: { id: 'bonsai', name: 'Japanese Bonsai Pine', category: 'Alam & Tanaman', emoji: '🪴', dishColor: '#132A13', builder: buildBonsaiArtisan },
  crystal: { id: 'crystal', name: 'Amethyst Crystal Cluster', category: 'Alam & Tanaman', emoji: '🔮', dishColor: '#240046', builder: buildCrystalArtisan },
  succulent: { id: 'succulent', name: 'Echeveria Mint Succulent', category: 'Alam & Tanaman', emoji: '🌱', dishColor: '#2D6A4F', builder: buildSucculentArtisan },
} satisfies Record<string, ArtisanDefinition>;

/**
 * Determines which artisan design belongs on each face of the Rubik's Cube
 * Exact 1:1 match to user reference image for Front, Top, and Right.
 * Full themed mix for Back, Left, and Bottom (Makanan, Hewan, Hal Lucu, Hal Seram, Boneka, Tanaman, Gunung, Api, Alam).
 */
export function getArtisanForFace(
  faceName: 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right',
  x: number,
  y: number,
  z: number
): ArtisanDefinition {
  // 1. FRONT FACE (Z = +1): Matches user image 100%
  if (faceName === 'front') {
    if (x === -1 && y === 1) return ARTISAN_REGISTRY.cat;
    if (x === 0 && y === 1) return ARTISAN_REGISTRY.sushi;
    if (x === 1 && y === 1) return ARTISAN_REGISTRY.ghost;
    if (x === -1 && y === 0) return ARTISAN_REGISTRY.panda;
    if (x === 0 && y === 0) return ARTISAN_REGISTRY.ramen;
    if (x === 1 && y === 0) return ARTISAN_REGISTRY.wave;
    if (x === -1 && y === -1) return ARTISAN_REGISTRY.scream;
    if (x === 0 && y === -1) return ARTISAN_REGISTRY.pumpkin;
    if (x === 1 && y === -1) return ARTISAN_REGISTRY.starry_night;
  }

  // 2. TOP FACE (Y = +1): Matches top view of reference image
  if (faceName === 'top') {
    if (x === -1 && z === 1) return ARTISAN_REGISTRY.botanical_leaf;
    if (x === 0 && z === 1) return ARTISAN_REGISTRY.frog;
    if (x === 1 && z === 1) return ARTISAN_REGISTRY.rose;
    if (x === -1 && z === 0) return ARTISAN_REGISTRY.botanical_leaf;
    if (x === 0 && z === 0) return ARTISAN_REGISTRY.creature;
    if (x === 1 && z === 0) return ARTISAN_REGISTRY.rose;
    if (x === -1 && z === -1) return ARTISAN_REGISTRY.starry_night;
    if (x === 0 && z === -1) return ARTISAN_REGISTRY.mushroom;
    if (x === 1 && z === -1) return ARTISAN_REGISTRY.bear;
  }

  // 3. RIGHT FACE (X = +1): Matches right view of reference image
  if (faceName === 'right') {
    if (y === 1 && z === 1) return ARTISAN_REGISTRY.flower;
    if (y === 1 && z === 0) return ARTISAN_REGISTRY.frog;
    if (y === 1 && z === -1) return ARTISAN_REGISTRY.bear;
    if (y === 0 && z === 1) return ARTISAN_REGISTRY.cactus;
    if (y === 0 && z === 0) return ARTISAN_REGISTRY.cactus;
    if (y === 0 && z === -1) return ARTISAN_REGISTRY.mushroom;
    if (y === -1 && z === 1) return ARTISAN_REGISTRY.donut;
    if (y === -1 && z === 0) return ARTISAN_REGISTRY.scream;
    if (y === -1 && z === -1) return ARTISAN_REGISTRY.donut;
  }

  // 4. BACK FACE (Z = -1): Gunung, Api, Makanan, Hal Seram & Boneka
  if (faceName === 'back') {
    if (x === -1 && y === 1) return ARTISAN_REGISTRY.pizza;
    if (x === 0 && y === 1) return ARTISAN_REGISTRY.fuji;
    if (x === 1 && y === 1) return ARTISAN_REGISTRY.volcano;
    if (x === -1 && y === 0) return ARTISAN_REGISTRY.boba;
    if (x === 0 && y === 0) return ARTISAN_REGISTRY.campfire;
    if (x === 1 && y === 0) return ARTISAN_REGISTRY.skull;
    if (x === -1 && y === -1) return ARTISAN_REGISTRY.voodoo;
    if (x === 0 && y === -1) return ARTISAN_REGISTRY.robot;
    if (x === 1 && y === -1) return ARTISAN_REGISTRY.crystal;
  }

  // 5. LEFT FACE (X = -1): Hewan Lucu, Tanaman, Hal Seram & Makanan
  if (faceName === 'left') {
    if (y === 1 && z === 1) return ARTISAN_REGISTRY.axolotl;
    if (y === 1 && z === 0) return ARTISAN_REGISTRY.duck;
    if (y === 1 && z === -1) return ARTISAN_REGISTRY.shiba;
    if (y === 0 && z === 1) return ARTISAN_REGISTRY.bonsai;
    if (y === 0 && z === 0) return ARTISAN_REGISTRY.succulent;
    if (y === 0 && z === -1) return ARTISAN_REGISTRY.bat;
    if (y === -1 && z === 1) return ARTISAN_REGISTRY.eyeball;
    if (y === -1 && z === 0) return ARTISAN_REGISTRY.croissant;
    if (y === -1 && z === -1) return ARTISAN_REGISTRY.campfire;
  }

  // 6. BOTTOM FACE (Y = -1): Alam, Kristal, Gunung, Boneka & Lucu
  if (faceName === 'bottom') {
    if (x === -1 && z === 1) return ARTISAN_REGISTRY.crystal;
    if (x === 0 && z === 1) return ARTISAN_REGISTRY.volcano;
    if (x === 1 && z === 1) return ARTISAN_REGISTRY.pizza;
    if (x === -1 && z === 0) return ARTISAN_REGISTRY.boba;
    if (x === 0 && z === 0) return ARTISAN_REGISTRY.fuji;
    if (x === 1 && z === 0) return ARTISAN_REGISTRY.bonsai;
    if (x === -1 && z === -1) return ARTISAN_REGISTRY.skull;
    if (x === 0 && z === -1) return ARTISAN_REGISTRY.robot;
    if (x === 1 && z === -1) return ARTISAN_REGISTRY.axolotl;
  }

  return ARTISAN_REGISTRY.cat;
}
