'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ImageReliefSpec } from '@keycap/shared';
import { KeySelectionMode } from './KeySelectionToolbar';

interface KeycapCanvas3DProps {
  selectionMode: KeySelectionMode;
  selectedKeyIds: string[];
  baseColor: string;
  legendColor: string;
  profile: 'CHERRY' | 'OEM';
  relief: ImageReliefSpec | null;
  keys: any[];
}

export default function KeycapCanvas3D({
  selectionMode,
  selectedKeyIds,
  baseColor,
  legendColor,
  profile,
  relief,
  keys,
}: KeycapCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [viewAngle, setViewAngle] = useState<'ISOMETRIC' | 'TOP' | 'FRONT'>('ISOMETRIC');
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#071E33');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 500;
    controls.minDistance = 20;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 3. Lighting (Warm Clay & Studio Setup)
    const ambientLight = new THREE.AmbientLight(0xfffdf8, 1.6);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfffdf8, 2.5);
    mainKeyLight.position.set(40, 70, 50);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xee964b, 1.2); // Warm apricot rim light
    fillLight.position.set(-50, 40, -40);
    scene.add(fillLight);

    const bottomBounce = new THREE.DirectionalLight(0x0d3b66, 0.4); // Subtle Prussian Navy bounce
    bottomBounce.position.set(0, -30, 20);
    scene.add(bottomBounce);

    // Ground plane with shadow receiver
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle warm grid helper
    const gridHelper = new THREE.GridHelper(240, 24, 0xee964b, 0xf4d35e);
    gridHelper.position.y = -0.4;
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.25;
      });
    } else {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
    }
    scene.add(gridHelper);

    // 4. Procedural Sculpted Keycap Generator
    const createKeycapGeometry = (uSize = 1, capProfile: 'CHERRY' | 'OEM') => {
      const baseW = 18 * uSize;
      const baseD = 18;
      const heightMm = capProfile === 'CHERRY' ? 9.5 : 11.5;

      // Construct a tapered box geometry
      const geo = new THREE.BoxGeometry(baseW, heightMm, baseD, 4, 4, 4);
      const pos = geo.getAttribute('position') as THREE.BufferAttribute;
      if (!pos) return geo;

      // Taper the top vertices to simulate ergonomic sculpted keycap
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          // Top half taper inward
          const x = pos.getX(i);
          const z = pos.getZ(i);
          pos.setX(i, x * 0.82);
          pos.setZ(i, z * 0.82);
          // Subtle dish dish-indentation on the center of top face
          const distCenter = Math.sqrt(x * x + z * z);
          if (distCenter < 7) {
            pos.setY(i, y - (1.2 - distCenter * 0.12));
          }
        }
      }
      geo.computeVertexNormals();
      return geo;
    };

    // 5. Materials
    const activeColor = new THREE.Color(baseColor || '#0D3B66');
    const dimmedColor = new THREE.Color('#0E365C'); // Warm muted tone for unselected keys

    const activeMaterial = new THREE.MeshStandardMaterial({
      color: activeColor,
      roughness: 0.28,
      metalness: 0.1,
    });

    const dimmedMaterial = new THREE.MeshStandardMaterial({
      color: dimmedColor,
      roughness: 0.6,
      metalness: 0.05,
      transparent: true,
      opacity: 0.45,
    });

    // 6. Generate Key Meshes based on layout
    const group = new THREE.Group();

    // Determine target subset of keys to render
    const keysToRender = keys.length > 0 ? keys : [
      { id: 'esc', label: 'ESC', x: -30, y: 0, size: 1 },
      { id: 'w', label: 'W', x: 0, y: 0, size: 1 },
      { id: 'a', label: 'A', x: -19, y: 19, size: 1 },
      { id: 's', label: 'S', x: 0, y: 19, size: 1 },
      { id: 'd', label: 'D', x: 19, y: 19, size: 1 },
      { id: 'space', label: 'SPACE', x: 0, y: 45, size: 6.25 },
    ];

    // Compute bounding box for auto-centering
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

    keysToRender.forEach((k: any) => {
      const isSelected = selectedKeyIds.length === 0 || selectedKeyIds.includes(k.id);
      const uSize = k.size || 1;
      const posX = (k.col !== undefined ? k.col * 19 : k.x || 0);
      const posZ = (k.row !== undefined ? k.row * 19 : k.y || 0);

      minX = Math.min(minX, posX);
      maxX = Math.max(maxX, posX + uSize * 19);
      minZ = Math.min(minZ, posZ);
      maxZ = Math.max(maxZ, posZ + 19);

      const capGeo = createKeycapGeometry(uSize, profile);
      const capMesh = new THREE.Mesh(capGeo, isSelected ? activeMaterial : dimmedMaterial);

      const heightMm = profile === 'CHERRY' ? 9.5 : 11.5;
      capMesh.position.set(posX, heightMm / 2, posZ);
      capMesh.castShadow = true;
      capMesh.receiveShadow = true;

      // Relief badge (if image relief active and key is selected)
      if (relief && isSelected) {
        const reliefGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.6, 24);
        const reliefMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(legendColor || '#F4D35E'),
          roughness: 0.2,
          metalness: 0.2,
        });
        const reliefMesh = new THREE.Mesh(reliefGeo, reliefMat);
        reliefMesh.position.set(posX, heightMm + 0.1, posZ);
        group.add(reliefMesh);
      }

      group.add(capMesh);
    });

    // Center the key group
    const centerX = (minX + maxX) / 2 || 0;
    const centerZ = (minZ + maxZ) / 2 || 0;
    group.position.set(-centerX, 0, -centerZ);
    scene.add(group);

    // Initial camera placement
    const span = Math.max(maxX - minX, maxZ - minZ, 80);
    camera.position.set(span * 0.7, span * 0.8, span * 1.1);
    controls.target.set(0, 5, 0);
    controls.update();

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [selectionMode, selectedKeyIds, baseColor, legendColor, profile, relief, keys, isAutoRotate]);

  const setCameraAngle = (angle: 'ISOMETRIC' | 'TOP' | 'FRONT') => {
    setViewAngle(angle);
    const controls = controlsRef.current;
    if (!controls) return;

    if (angle === 'TOP') {
      controls.object.position.set(0, 75, 0.1);
      controls.target.set(0, 0, 0);
    } else if (angle === 'FRONT') {
      controls.object.position.set(0, 15, 60);
      controls.target.set(0, 5, 0);
    } else {
      controls.object.position.set(0, 45, 55);
      controls.target.set(0, 5, 0);
    }
    controls.update();
  };

  return (
    <div className="relative w-full h-[450px] rounded-3xl border border-[#FAF0CA]/12 bg-[#071E33] overflow-hidden shadow-xl">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Toolbar */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-auto">
        <span className="clay-pill inline-flex items-center gap-1.5 bg-[#0D3B66]/90 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-bold text-[#0D3B66] border border-[#FAF0CA]/12 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#F95738] animate-pulse" />
          Three.js WebGL Engine
        </span>

        {selectionMode === 'WASD' && (
          <span className="clay-pill bg-[#F95738]/15 border border-[#F95738]/30 px-3 py-1 text-[11px] font-bold text-[#F95738]">
            🎮 Mode Fokus: WASD Cluster
          </span>
        )}
      </div>

      {/* Camera angle & animation controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        <div className="clay-card flex items-center gap-1 bg-[#0D3B66]/90 backdrop-blur-md border border-[#FAF0CA]/12 rounded-2xl p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setCameraAngle('ISOMETRIC')}
            className={`px-3 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer ${
              viewAngle === 'ISOMETRIC' ? 'bg-[#0D3B66] text-white shadow-sm' : 'text-[#BACAD6] hover:text-[#0D3B66]'
            }`}
          >
            Iso
          </button>
          <button
            type="button"
            onClick={() => setCameraAngle('TOP')}
            className={`px-3 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer ${
              viewAngle === 'TOP' ? 'bg-[#0D3B66] text-white shadow-sm' : 'text-[#BACAD6] hover:text-[#0D3B66]'
            }`}
          >
            Atas
          </button>
          <button
            type="button"
            onClick={() => setCameraAngle('FRONT')}
            className={`px-3 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer ${
              viewAngle === 'FRONT' ? 'bg-[#0D3B66] text-white shadow-sm' : 'text-[#BACAD6] hover:text-[#0D3B66]'
            }`}
          >
            Depan
          </button>
        </div>

        <div className="clay-card flex items-center gap-2 bg-[#0D3B66]/90 backdrop-blur-md border border-[#FAF0CA]/12 rounded-2xl p-1 px-3 shadow-sm">
          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-xl transition cursor-pointer ${
              isAutoRotate ? 'text-[#F95738] font-black' : 'text-[#BACAD6] hover:text-[#0D3B66]'
            }`}
          >
            <span>🔄</span> {isAutoRotate ? 'Stop Putar' : 'Auto-Putar'}
          </button>
        </div>
      </div>
    </div>
  );
}
