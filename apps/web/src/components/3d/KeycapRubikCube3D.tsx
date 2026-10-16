'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  Play,
  Pause,
  Sparkles,
  Shuffle,
  ChevronDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ARTISAN_REGISTRY } from './artisanBuilders';

export type ThemeType = 'ARTISAN_COLLECTION' | 'PASTEL_MACARON' | 'WARM_TERRACOTTA';

interface ThemeConfig {
  name: string;
  badge: string;
  accentColor: string;
  housingColor: string;
  coreColor: string;
  stemColor: string;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  ARTISAN_COLLECTION: {
    name: 'Artisan Toy Collection',
    badge: '26 Sculpted 3D Miniatures',
    accentColor: '#F95738',
    housingColor: '#FFFDF8',
    coreColor: '#090A0E',
    stemColor: '#F4D35E',
  },
  PASTEL_MACARON: {
    name: 'Prussian & Saffron Studio',
    badge: 'Retro Bauhaus Palette',
    accentColor: '#EE964B',
    housingColor: '#FAF0CA',
    coreColor: '#0A0C12',
    stemColor: '#F4D35E',
  },
  WARM_TERRACOTTA: {
    name: 'Vermilion Sunburst',
    badge: 'High Contrast Clay',
    accentColor: '#F95738',
    housingColor: '#FFFDF8',
    coreColor: '#07080B',
    stemColor: '#EE964B',
  },
};

interface HoveredInfo {
  name: string;
  emoji: string;
  category?: string;
  description?: string;
}

interface CubeletItem {
  group: THREE.Group;
  initialPos: THREE.Vector3;
  initialQuat: THREE.Quaternion;
  originalPos: THREE.Vector3;
  normal: THREE.Vector3;
  currentPos: THREE.Vector3;
  gridCoord: { x: number; y: number; z: number };
  id: string;
  clickableMeshes: THREE.Mesh[];
}

export default function KeycapRubikCube3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('ARTISAN_COLLECTION');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredArtisan, setHoveredArtisan] = useState<HoveredInfo | null>(null);
  const [isTwisting, setIsTwisting] = useState(false);
  const [slideMenuOpen, setSlideMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cubeletsRef = useRef<CubeletItem[]>([]);
  const clickableMeshesRef = useRef<THREE.Mesh[]>([]);
  const pivotGroupRef = useRef<THREE.Group | null>(null);

  const twistRef = useRef<{
    active: boolean;
    layer: number;
    currentAngle: number;
    targetAngle: number;
    speed: number;
    rotatingCubies: CubeletItem[];
  }>({
    active: false,
    layer: 1,
    currentAngle: 0,
    targetAngle: 0,
    speed: 5.8,
    rotatingCubies: [],
  });

  const coreGroupRef = useRef<THREE.Group | null>(null);
  const targetExplodeRef = useRef(0.0);
  const currentExplodeRef = useRef(0.0);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Realistic Mechanical Switch Thock via Web Audio API
  const playThockSound = useCallback((pitchMultiplier: number = 1.0) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // 1. Fundamental Thock Body (deep resonant bottom-out)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(125 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(36 * pitchMultiplier, now + 0.08);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // 2. High-Frequency Tactile Crisp Snap (switch leaf click)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(960 * pitchMultiplier, now);
      clickOsc.frequency.exponentialRampToValueAtTime(170, now + 0.025);

      clickGain.gain.setValueAtTime(0.16, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.035);
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Update theme housing color dynamically
  useEffect(() => {
    const theme = THEMES[currentTheme];
    for (const c of cubeletsRef.current) {
      c.group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.name.includes('Housing')) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat && mat.color) {
            mat.color.set(theme.housingColor);
          }
        }
      });
    }
  }, [currentTheme]);

  // Three.js Canvas Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Pivot group for rotation mechanics
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    pivotGroupRef.current = pivotGroup;

    // Perspective Camera angled to showcase front, top, and right faces simultaneously
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 1000);
    camera.position.set(65, 52, 95);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Soft Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.90);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(70, 100, 80);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const rimWarmLight = new THREE.PointLight(0xffedd5, 1.8, 250);
    rimWarmLight.position.set(-70, 45, -60);
    scene.add(rimWarmLight);

    const rimCoolLight = new THREE.PointLight(0xdbeafe, 1.6, 250);
    rimCoolLight.position.set(60, -35, -70);
    scene.add(rimCoolLight);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 65;
    controls.maxDistance = 180;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // 4. Load Masterpiece Blender GLB Model
    const loader = new GLTFLoader();
    const cubeletSpacing = 15.6;
    const scaleFactor = 7.255814; // Scales Blender 2.15 spacing to Three.js 15.6 units

    loader.load(
      '/models/artisan_rubik.glb',
      (gltf) => {
        setIsLoading(false);
        const rootScene = gltf.scene;

        // A. Obsidian Core Sphere ("Bola Hitam Cool")
        const core = rootScene.getObjectByName('Core_Black_Sphere_Group') as THREE.Group | undefined;
        if (core) {
          core.scale.set(scaleFactor, scaleFactor, scaleFactor);
          core.position.set(0, 0, 0);
          core.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(core);
          coreGroupRef.current = core;
        }

        // B. Collect all 26 Cubie Groups (Copy array first to avoid unparenting mutation bug)
        const cubieNodes: THREE.Object3D[] = [];
        rootScene.traverse((obj) => {
          if (/^Cubie_-?\d+_-?\d+_-?\d+$/.test(obj.name)) {
            cubieNodes.push(obj);
          }
        });

        const cubeletList: CubeletItem[] = [];
        const allClickableMeshes: THREE.Mesh[] = [];

        cubieNodes.forEach((obj) => {
          const match = obj.name.match(/^Cubie_(-?\d+)_(-?\d+)_(-?\d+)$/);
          if (match && match[1] && match[2] && match[3]) {
            const bx = parseInt(match[1], 10);
            const by = parseInt(match[2], 10);
            const bz = parseInt(match[3], 10);

            // Convert Blender coordinates to Three.js coordinates
            const gx = bx;
            const gy = bz;
            const gz = -by;

            const basePos = new THREE.Vector3(gx * cubeletSpacing, gy * cubeletSpacing, gz * cubeletSpacing);
            const normal = basePos.clone().normalize();

            obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
            obj.position.copy(basePos);

            const clickableInCubelet: THREE.Mesh[] = [];

            obj.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                clickableInCubelet.push(child as THREE.Mesh);

                // Identify which sculpted figurine this part belongs to
                let curr: THREE.Object3D | null = child;
                let matchedArtisanKey: string | null = null;

                while (curr && curr !== obj) {
                  const nameLower = curr.name.toLowerCase();
                  for (const key of Object.keys(ARTISAN_REGISTRY)) {
                    if (nameLower.endsWith(`_${key}`) || nameLower.includes(`_${key}_`) || nameLower.includes(`_${key}`)) {
                      matchedArtisanKey = key;
                      break;
                    }
                  }
                  if (matchedArtisanKey) break;
                  curr = curr.parent;
                }

                if (matchedArtisanKey && ARTISAN_REGISTRY[matchedArtisanKey as keyof typeof ARTISAN_REGISTRY]) {
                  const art = ARTISAN_REGISTRY[matchedArtisanKey as keyof typeof ARTISAN_REGISTRY];
                  child.userData = {
                    id: `artisan-${matchedArtisanKey}`,
                    name: art.name,
                    emoji: art.emoji,
                    category: art.category,
                    description: `${art.name} artisan keycap sculpted in Blender`,
                  };
                } else if (child.name.includes('Housing')) {
                  child.userData = {
                    id: `housing-${gx}-${gy}-${gz}`,
                    name: 'Artisan Keycap Housing',
                    emoji: '⌨️',
                    category: 'Keycap Base',
                    description: 'Warm Alabaster porcelain housing with Cherry MX mount',
                  };
                } else {
                  child.userData = {
                    id: `detail-${gx}-${gy}-${gz}`,
                    name: 'Sculpted Artisan Detail',
                    emoji: '✨',
                    category: 'Blender Masterpiece',
                    description: 'Hyper-detailed 3D miniature sculpt',
                  };
                }
              }
            });

            scene.add(obj);
            allClickableMeshes.push(...clickableInCubelet);

            cubeletList.push({
              group: obj as THREE.Group,
              initialPos: basePos.clone(),
              initialQuat: obj.quaternion.clone(),
              originalPos: basePos.clone(),
              normal,
              currentPos: basePos.clone(),
              gridCoord: { x: gx, y: gy, z: gz },
              id: `cubie-${gx}-${gy}-${gz}`,
              clickableMeshes: clickableInCubelet,
            });
          }
        });

        cubeletsRef.current = cubeletList;
        clickableMeshesRef.current = allClickableMeshes;
      },
      undefined,
      (err) => {
        console.error('Error loading artisan_rubik.glb:', err);
        setIsLoading(false);
      }
    );

    // 5. Raycaster for Hover & Click (Detects Exact Figurine Hit)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableMeshesRef.current);

      if (intersects.length > 0 && intersects[0]) {
        const hitData = intersects[0].object.userData as HoveredInfo;
        if (hitData && hitData.name) {
          setHoveredArtisan(hitData);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredArtisan(null);
      container.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableMeshesRef.current);

      if (intersects.length > 0 && intersects[0]) {
        const hit = intersects[0];
        const hitCubelet = cubeletsRef.current.find((c) =>
          c.clickableMeshes.includes(hit.object as THREE.Mesh)
        );
        if (hitCubelet) {
          playThockSound(1.0 + (Math.random() * 0.2 - 0.1));

          // Tactile switch push-down animation (depresses inward slightly)
          const pushDirection = hitCubelet.normal.clone().multiplyScalar(-3.2);
          hitCubelet.group.position.add(pushDirection);

          setTimeout(() => {
            hitCubelet.group.position.copy(hitCubelet.currentPos);
          }, 95);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 6. Smooth Animation Loop (60 FPS with Explode Lerp & Multi-Layer Slice Twist)
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth Exploded View Dispersion Lerp
      currentExplodeRef.current = THREE.MathUtils.lerp(
        currentExplodeRef.current,
        targetExplodeRef.current,
        0.08
      );

      const explodeFactor = currentExplodeRef.current;
      const maxExplodeDistance = 22; // Disperse up to 22 units outward radially

      // Rotate obsidian core slowly when in exploded view for a mesmerizing look
      if (coreGroupRef.current && explodeFactor > 0.05) {
        coreGroupRef.current.rotation.y += delta * 0.35;
        coreGroupRef.current.rotation.x += delta * 0.15;
      }

      // Handle Layer Twist Animation via Pivot Group
      const twist = twistRef.current;
      if (twist.active && pivotGroupRef.current) {
        twist.currentAngle += delta * twist.speed;

        if (twist.currentAngle >= twist.targetAngle) {
          // Finish Twist cleanly
          pivotGroupRef.current.rotation.y = twist.targetAngle;
          pivotGroupRef.current.updateMatrixWorld(true);

          // Re-attach all rotating cubies back to scene
          for (const cubelet of twist.rotatingCubies) {
            scene.attach(cubelet.group);

            // Snap new grid position from world coordinates
            const gx = Math.round(cubelet.group.position.x / cubeletSpacing);
            const gy = Math.round(cubelet.group.position.y / cubeletSpacing);
            const gz = Math.round(cubelet.group.position.z / cubeletSpacing);

            cubelet.gridCoord = { x: gx, y: gy, z: gz };
            cubelet.originalPos.set(gx * cubeletSpacing, gy * cubeletSpacing, gz * cubeletSpacing);
            cubelet.normal.copy(cubelet.originalPos).normalize();
            cubelet.currentPos.copy(cubelet.group.position);
          }

          // Reset pivot rotation
          pivotGroupRef.current.rotation.set(0, 0, 0);
          twist.active = false;
          setIsTwisting(false);
        } else {
          pivotGroupRef.current.rotation.y = twist.currentAngle;
        }
      }

      // Handle Exploded View position updates (when not actively twisting)
      if (!twist.active) {
        for (const cubelet of cubeletsRef.current) {
          const targetPos = cubelet.originalPos
            .clone()
            .add(cubelet.normal.clone().multiplyScalar(explodeFactor * maxExplodeDistance));
          cubelet.currentPos.copy(targetPos);
          cubelet.group.position.copy(targetPos);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      controls.dispose();
    };
  }, [playThockSound, autoRotate]);

  // Toggle Exploded View
  const toggleExplode = () => {
    playThockSound(1.1);
    const nextState = !exploded;
    setExploded(nextState);
    targetExplodeRef.current = nextState ? 1.0 : 0.0;
  };

  // Trigger Slide / Layer Twist for Specified Layer using Pivot Group
  const triggerSlide = (layer: number = 1, angle: number = Math.PI / 2) => {
    if (isTwisting || twistRef.current.active || !pivotGroupRef.current || !sceneRef.current) return;

    // Reset exploded view if opened before twisting
    if (targetExplodeRef.current > 0.05) {
      setExploded(false);
      targetExplodeRef.current = 0.0;
    }

    setIsTwisting(true);
    setSlideMenuOpen(false);
    playThockSound(layer === 1 ? 0.95 : layer === 0 ? 0.85 : 0.75);

    const pivot = pivotGroupRef.current;
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld(true);

    // Find the 9 cubies in this layer
    const rotating = cubeletsRef.current.filter((c) => c.gridCoord.y === layer);
    rotating.forEach((c) => {
      pivot.attach(c.group);
    });

    twistRef.current = {
      active: true,
      layer,
      currentAngle: 0,
      targetAngle: angle,
      speed: 5.6,
      rotatingCubies: rotating,
    };
  };

  // Shuffle / Random Slide Action
  const triggerRandomSlide = () => {
    if (isTwisting) return;
    const layers = [1, 0, -1];
    const randomLayer = layers[Math.floor(Math.random() * layers.length)] ?? 1;
    triggerSlide(randomLayer, Math.PI / 2);
  };

  // Reset Rubik's Cube to Solved State
  const resetCube = () => {
    if (isTwisting || !sceneRef.current) return;
    playThockSound(1.25);
    setExploded(false);
    targetExplodeRef.current = 0.0;
    currentExplodeRef.current = 0.0;

    for (const c of cubeletsRef.current) {
      sceneRef.current.attach(c.group);
      c.group.position.copy(c.initialPos);
      c.group.quaternion.copy(c.initialQuat);
      c.originalPos.copy(c.initialPos);
      c.currentPos.copy(c.initialPos);
      c.normal.copy(c.initialPos).normalize();
      const gx = Math.round(c.initialPos.x / 15.6);
      const gy = Math.round(c.initialPos.y / 15.6);
      const gz = Math.round(c.initialPos.z / 15.6);
      c.gridCoord = { x: gx, y: gy, z: gz };
    }

    if (pivotGroupRef.current) {
      pivotGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  // Switch Theme
  const cycleTheme = () => {
    playThockSound(1.2);
    const themeKeys: ThemeType[] = ['ARTISAN_COLLECTION', 'PASTEL_MACARON', 'WARM_TERRACOTTA'];
    const nextIndex = (themeKeys.indexOf(currentTheme) + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex] ?? 'ARTISAN_COLLECTION';
    setCurrentTheme(nextTheme);
  };

  const resetCamera = () => {
    playThockSound(1.0);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] flex flex-col items-center justify-between select-none">
      {/* Top Floating Badge & Info Pill */}
      <div className="z-10 flex flex-wrap items-center justify-between w-full max-w-2xl px-2 gap-2 pointer-events-auto">
        <div className="clay-pill px-3.5 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F95738] animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#0D3B66]">
            Rubik's MX-26 Artisan Masterpiece
          </span>
          <span className="text-[11px] font-semibold text-[#4A6B8A]">
            • {THEMES[currentTheme].badge}
          </span>
          {hoveredArtisan && (
            <span
              className="ml-1 text-[11px] font-mono text-[#F95738] bg-[#FFF6EC] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title={hoveredArtisan.description}
            >
              <span>{hoveredArtisan.emoji}</span>
              <span>{hoveredArtisan.name}</span>
              {hoveredArtisan.category && (
                <span className="text-[10px] text-[#4A6B8A] opacity-75 hidden sm:inline">
                  ({hoveredArtisan.category})
                </span>
              )}
            </span>
          )}
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan Suara Thock' : 'Nyalakan Suara Thock'}
            className="clay-pill px-3 py-1.5 text-xs text-[#0D3B66] hover:text-[#F95738] transition flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#0D3B66]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#4A6B8A]" />
            )}
            <span className="hidden sm:inline text-[11px] font-medium">Thock</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Auto Spin Orbit"
            className="clay-pill px-3 py-1.5 text-xs text-[#0D3B66] hover:text-[#F95738] transition flex items-center gap-1.5 cursor-pointer"
          >
            {autoRotate ? (
              <Pause className="w-3.5 h-3.5 text-[#F95738]" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[#4A6B8A]" />
            )}
            <span className="hidden sm:inline text-[11px] font-medium">Auto Spin</span>
          </button>

          <button
            onClick={resetCube}
            title="Kembalikan Kubus ke Posisi Rapi (Solved)"
            className="clay-pill p-1.5 text-[#4A6B8A] hover:text-[#0D3B66] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetCamera}
            title="Reset Posisi Kamera"
            className="clay-pill p-1.5 text-[#4A6B8A] hover:text-[#0D3B66] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FFFDF8]/60 backdrop-blur-md transition-all">
          <div className="clay-card p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#F95738] animate-spin" />
            <span className="text-xs font-mono font-bold text-[#0D3B66]">
              Memuat Masterpiece 3D Artisan Rubik...
            </span>
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas Container - FLOATING BORDERLESS */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Accessible Screen Reader Information */}
      <div className="sr-only">Interactive 3D Artisan Keycap Rubik Puzzle with Obsidian Chrome Core</div>

      {/* Bottom Floating Soft Claymorphic Control Bar */}
      <div className="z-10 pointer-events-auto flex flex-wrap items-center justify-center gap-2 p-2 rounded-full bg-[#FFFDF8]/95 backdrop-blur-xl shadow-[8px_12px_28px_rgba(13,59,102,0.12)] border border-white max-w-full">
        {/* Exploded View Control */}
        <button
          onClick={toggleExplode}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            exploded ? 'clay-btn-primary' : 'clay-btn-secondary'
          }`}
          title={exploded ? 'Gabungkan kembali 26 keycap' : 'Buka exploded view untuk melihat bola hitam cool & switch core stem'}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{exploded ? 'Gabungkan Kubus' : 'Exploded View (Bola Hitam)'}</span>
        </button>

        {/* Action Slide Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSlideMenuOpen(!slideMenuOpen)}
            disabled={isTwisting}
            className="clay-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Pilih layer untuk diputar/slide"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isTwisting ? 'animate-spin' : ''}`} />
            <span>Slide Action</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {slideMenuOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#FFFDF8] border border-[#EAE3D2] rounded-2xl p-2 shadow-xl flex flex-col gap-1 w-44 z-20 backdrop-blur-lg">
              <div className="text-[10px] font-mono font-bold text-[#4A6B8A] px-2 py-0.5">
                PILIH LAYER SLIDE:
              </div>
              <button
                onClick={() => triggerSlide(1)}
                className="text-left px-3 py-1.5 text-xs font-semibold text-[#0D3B66] hover:bg-[#FFF6EC] hover:text-[#F95738] rounded-xl transition flex items-center justify-between"
              >
                <span>Slide Top Layer</span>
                <span className="text-[10px] text-[#EE964B]">90°</span>
              </button>
              <button
                onClick={() => triggerSlide(0)}
                className="text-left px-3 py-1.5 text-xs font-semibold text-[#0D3B66] hover:bg-[#FFF6EC] hover:text-[#F95738] rounded-xl transition flex items-center justify-between"
              >
                <span>Slide Middle Layer</span>
                <span className="text-[10px] text-[#EE964B]">90°</span>
              </button>
              <button
                onClick={() => triggerSlide(-1)}
                className="text-left px-3 py-1.5 text-xs font-semibold text-[#0D3B66] hover:bg-[#FFF6EC] hover:text-[#F95738] rounded-xl transition flex items-center justify-between"
              >
                <span>Slide Bottom Layer</span>
                <span className="text-[10px] text-[#EE964B]">90°</span>
              </button>
              <div className="h-px bg-[#EAE3D2] my-0.5" />
              <button
                onClick={triggerRandomSlide}
                className="text-left px-3 py-1.5 text-xs font-bold text-[#F95738] hover:bg-[#FFF6EC] rounded-xl transition flex items-center gap-1.5"
              >
                <Shuffle className="w-3 h-3" />
                <span>Shuffle Slice</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Shuffle Slide Button */}
        <button
          onClick={triggerRandomSlide}
          disabled={isTwisting}
          className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          title="Putar layer acak"
        >
          <Shuffle className="w-3.5 h-3.5 text-[#F95738]" />
          <span className="hidden sm:inline">Shuffle</span>
        </button>

        {/* Rapihkan / Reset Button */}
        <button
          onClick={resetCube}
          disabled={isTwisting}
          className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          title="Kembalikan kubus ke bentuk sempurna"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0D3B66]" />
          <span className="hidden sm:inline">Rapihkan</span>
        </button>

        {/* Cycle Theme */}
        <button
          onClick={cycleTheme}
          className="clay-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          title="Ganti palet warna"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F95738]" />
          <span>{THEMES[currentTheme].name}</span>
        </button>
      </div>
    </div>
  );
}
