"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * Three.js Apple/Linear-Grade Ambient Fluid Horizon Canvas:
 * Features silky-smooth harmonic fluid ribbons, subtle pointer-tracking specular highlights,
 * and floating specular bokeh particles with elegant depth-of-field.
 */
export function HullScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isLight = resolvedTheme !== "dark";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 2.0, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.1 : 1.25;

    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // 2. Lighting Architecture
    const ambientLight = new THREE.AmbientLight(isLight ? 0xffffff : 0x0f172a, isLight ? 1.2 : 0.8);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(isLight ? 0x0284c7 : 0x38bdf8, isLight ? 1.8 : 2.5);
    mainKeyLight.position.set(6, 8, 5);
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(isLight ? 0x0ea5e9 : 0x0369a1, isLight ? 0.8 : 1.4);
    fillLight.position.set(-6, -4, 3);
    scene.add(fillLight);

    // Interactive Floating Cursor Glow
    const cursorGlow = new THREE.PointLight(isLight ? 0x38bdf8 : 0x67e8f9, isLight ? 2.5 : 4.0, 12);
    cursorGlow.position.set(0, 1, 3);
    scene.add(cursorGlow);

    // 3. Fluid Organic Ribbon Geometry
    const gridX = 90;
    const gridY = 70;
    const planeGeo = new THREE.PlaneGeometry(22, 16, gridX, gridY);
    const planePos = planeGeo.attributes.position;
    const initialZ = new Float32Array(planePos.count);
    const initialX = new Float32Array(planePos.count);
    const initialY = new Float32Array(planePos.count);

    for (let i = 0; i < planePos.count; i++) {
      initialX[i] = planePos.getX(i);
      initialY[i] = planePos.getY(i);
      initialZ[i] = planePos.getZ(i);
    }

    // High-end Material with Specular Sheen
    const planeMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0x0284c7 : 0x0369a1,
      emissive: isLight ? 0x0284c7 : 0x0c4a6e,
      emissiveIntensity: isLight ? 0.12 : 0.4,
      roughness: isLight ? 0.25 : 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: isLight ? 0.18 : 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const fluidMesh = new THREE.Mesh(planeGeo, planeMat);
    fluidMesh.rotation.x = -Math.PI / 2.35;
    fluidMesh.position.set(0, -0.85, 0);
    scene.add(fluidMesh);

    // 4. Floating Specular Bokeh Particles
    const PARTICLE_COUNT = 75;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(PARTICLE_COUNT * 3);
    const partScales = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 16;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 8 + 0.5;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1;
      partScales[i] = Math.random() * 0.05 + 0.02;
    }

    partGeo.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));

    // Particle Material
    const partMat = new THREE.PointsMaterial({
      color: isLight ? 0x0284c7 : 0x7dd3fc,
      size: isLight ? 0.045 : 0.055,
      transparent: true,
      opacity: isLight ? 0.45 : 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // 5. Smooth Pointer Tracking with Damping
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = nx;
      mouse.targetY = ny;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer interpolation (low-pass filter)
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // Update Cursor Light Position in 3D Space
      cursorGlow.position.x = mouse.x * 5.0;
      cursorGlow.position.y = mouse.y * 2.8 + 0.8;
      cursorGlow.position.z = 2.8;

      // Gentle Camera Parallax
      camera.position.x = mouse.x * 0.5;
      camera.position.y = 2.0 + mouse.y * 0.3;
      camera.lookAt(0, 0, 0);

      // Subtle Mesh Undulation (Smooth Harmonic Waves)
      if (!prefersReduced) {
        const positions = planeGeo.attributes.position;
        const speed = 0.55;

        for (let i = 0; i < positions.count; i++) {
          const u = initialX[i];
          const v = initialY[i];

          // Harmonic layered waves
          const wave1 = Math.sin(u * 0.4 + elapsed * speed) * 0.32;
          const wave2 = Math.cos(v * 0.35 + elapsed * (speed * 0.8)) * 0.28;
          const wave3 = Math.sin((u + v) * 0.25 + elapsed * (speed * 0.6)) * 0.18;

          // Subtle cursor proximity elevation
          const dx = u - mouse.x * 5.5;
          const dy = v - mouse.y * 3.5;
          const distSq = dx * dx + dy * dy;
          const cursorFactor = Math.exp(-distSq / 12.0) * 0.25;

          positions.setZ(i, initialZ[i] + wave1 + wave2 + wave3 + cursorFactor);
        }
        positions.needsUpdate = true;
        planeGeo.computeVertexNormals();

        // Slow organic drift for ambient particles
        particles.rotation.y = elapsed * 0.02 + mouse.x * 0.05;
        particles.rotation.x = elapsed * 0.01 + mouse.y * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      planeGeo.dispose();
      planeMat.dispose();
      partGeo.dispose();
      partMat.dispose();
      renderer.dispose();
    };
  }, [resolvedTheme]);

  return <div ref={mountRef} className="hero-rebuild-art antigravity-canvas-container" />;
}
