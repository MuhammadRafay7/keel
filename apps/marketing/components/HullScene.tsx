"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * Three.js Antigravity 3D Interactive Hero Canvas:
 * Features a floating quantum antigravity core, nested counter-rotating gyroscope rings,
 * glowing field arcs, and a floating particle field that responds to pointer gravity.
 */
export function HullScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isLight = resolvedTheme === "light";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    const antigravityRoot = new THREE.Group();
    scene.add(antigravityRoot);

    // Dynamic Theme Colors
    const COLOR_ACCENT = isLight ? new THREE.Color("#006399") : new THREE.Color("#38bdf8");
    const COLOR_CYAN = isLight ? new THREE.Color("#0284c7") : new THREE.Color("#67e8f9");
    const COLOR_DIM = isLight ? new THREE.Color("#94a3b8") : new THREE.Color("#334155");

    // 1. Quantum Core Icosahedron Wireframe
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: COLOR_ACCENT,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.35 : 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    antigravityRoot.add(coreMesh);

    // Inner glowing core nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(0.7, 0);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: COLOR_CYAN,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.6 : 0.8,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    antigravityRoot.add(nucleusMesh);

    // 2. Three Orthogonal Antigravity Gyroscope Rings
    const createGyroRing = (radius: number, tubeRadius: number, color: THREE.Color, opacity: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
      });
      return new THREE.Mesh(ringGeo, ringMat);
    };

    const ring1 = createGyroRing(2.6, 0.02, COLOR_ACCENT, isLight ? 0.4 : 0.6);
    const ring2 = createGyroRing(3.2, 0.018, COLOR_CYAN, isLight ? 0.3 : 0.5);
    ring2.rotation.x = Math.PI / 3;
    const ring3 = createGyroRing(3.8, 0.015, COLOR_DIM, isLight ? 0.25 : 0.4);
    ring3.rotation.y = Math.PI / 4;

    antigravityRoot.add(ring1);
    antigravityRoot.add(ring2);
    antigravityRoot.add(ring3);

    // 3. Orbital Curved Gravity Field Lines
    const FIELD_LINES_COUNT = 8;
    const fieldLines: THREE.Line[] = [];
    for (let i = 0; i < FIELD_LINES_COUNT; i++) {
      const angle = (i / FIELD_LINES_COUNT) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      const steps = 40;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const rad = 1.6 + Math.sin(t * Math.PI) * 2.4;
        const x = Math.cos(angle + t * 2) * rad;
        const y = (t - 0.5) * 4.5;
        const z = Math.sin(angle + t * 2) * rad;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? COLOR_ACCENT : COLOR_CYAN,
        transparent: true,
        opacity: isLight ? 0.2 : 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      fieldLines.push(line);
      antigravityRoot.add(line);
    }

    // 4. Antigravity Particle Field (Floating Quantum Dust)
    const PARTICLE_COUNT = 450;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleBasePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 2.0 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleBasePositions[i * 3] = x;
      particleBasePositions[i * 3 + 1] = y;
      particleBasePositions[i * 3 + 2] = z;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: isLight ? 0.065 : 0.08,
      color: COLOR_ACCENT,
      transparent: true,
      opacity: isLight ? 0.65 : 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    antigravityRoot.add(particles);

    // 5. Interactive Orbit & Gravity Drag
    let targetRotX = 0.15;
    let targetRotY = 0.3;
    let currentRotX = 0.15;
    let currentRotY = 0.3;
    let dragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        /* fallback */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (dragging) {
        targetRotY += (e.clientX - lastMouseX) * 0.005;
        targetRotX += (e.clientY - lastMouseY) * 0.005;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        /* fallback */
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Resize handler
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    onResize();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    // Animation loop
    let raf = 0;
    const startTime = performance.now();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Auto rotation when idle
      if (!dragging && !prefersReduced) {
        targetRotY += 0.0025;
        targetRotX = Math.sin(elapsed * 0.4) * 0.15 + 0.1;
      }

      // Smooth camera orbit
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;

      antigravityRoot.rotation.x = currentRotX;
      antigravityRoot.rotation.y = currentRotY;

      // Gyroscope counter-rotations
      ring1.rotation.z = elapsed * 0.4;
      ring2.rotation.y = -elapsed * 0.35;
      ring3.rotation.x = elapsed * 0.25;

      coreMesh.rotation.y = -elapsed * 0.3;
      coreMesh.rotation.z = elapsed * 0.15;
      nucleusMesh.rotation.y = elapsed * 0.6;
      nucleusMesh.rotation.x = elapsed * 0.4;

      // Floating particles floating buoyancy & pointer interaction
      if (!prefersReduced) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i * 3;

          // Buoyancy wave
          positions[idx + 1] = particleBasePositions[idx + 1] + Math.sin(elapsed * 1.5 + i * 0.1) * 0.2;
          positions[idx] = particleBasePositions[idx] + Math.cos(elapsed * 1.2 + i * 0.15) * 0.15;
          positions[idx + 2] = particleBasePositions[idx + 2] + Math.sin(elapsed * 0.8 + i * 0.08) * 0.15;

          // Gentle mouse gravity reaction
          positions[idx] += pointerX * 0.08 * (1 / (1 + Math.abs(positions[idx])));
          positions[idx + 1] += pointerY * 0.08 * (1 / (1 + Math.abs(positions[idx + 1])));
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Subtle pulsing for field lines
        fieldLines.forEach((line, index) => {
          const mat = line.material as THREE.LineBasicMaterial;
          mat.opacity = (isLight ? 0.15 : 0.25) + Math.sin(elapsed * 2 + index) * 0.1;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [resolvedTheme]);

  return <div ref={mountRef} className="antigravity-canvas-container" aria-hidden="true" />;
}
