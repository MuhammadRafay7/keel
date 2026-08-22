"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * High-Precision Ambient Interactive Canvas (ClickUp / Stripe / Linear style):
 * Features an interactive spotlight-illuminated dot matrix grid, soft ambient glow auras,
 * and delicate floating specular dust particles. Non-distracting, clean, and modern.
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
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);

    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // 2. High-Precision Interactive Dot Matrix Grid
    const cols = 48;
    const rows = 28;
    const totalDots = cols * rows;
    const spacingX = 0.55;
    const spacingY = 0.45;
    const offsetX = ((cols - 1) * spacingX) / 2;
    const offsetY = ((rows - 1) * spacingY) / 2;

    const gridGeo = new THREE.BufferGeometry();
    const gridPositions = new Float32Array(totalDots * 3);
    const gridBaseColors = new Float32Array(totalDots * 3);
    const gridColors = new Float32Array(totalDots * 3);

    const baseColorLight = new THREE.Color(0x94a3b8);
    const baseColorDark = new THREE.Color(0x1e293b);
    const glowColor = new THREE.Color(isLight ? 0x0284c7 : 0x38bdf8);
    const centerColor = new THREE.Color(isLight ? 0x0ea5e9 : 0x0284c7);

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacingX - offsetX;
        const y = -(r * spacingY - offsetY);
        const z = 0;

        gridPositions[idx * 3] = x;
        gridPositions[idx * 3 + 1] = y;
        gridPositions[idx * 3 + 2] = z;

        const base = isLight ? baseColorLight : baseColorDark;
        gridBaseColors[idx * 3] = base.r;
        gridBaseColors[idx * 3 + 1] = base.g;
        gridBaseColors[idx * 3 + 2] = base.b;

        gridColors[idx * 3] = base.r;
        gridColors[idx * 3 + 1] = base.g;
        gridColors[idx * 3 + 2] = base.b;

        idx++;
      }
    }

    gridGeo.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));
    gridGeo.setAttribute("color", new THREE.BufferAttribute(gridColors, 3));

    const gridMat = new THREE.PointsMaterial({
      size: isLight ? 0.04 : 0.045,
      vertexColors: true,
      transparent: true,
      opacity: isLight ? 0.45 : 0.6,
      blending: THREE.NormalBlending,
    });

    const gridPoints = new THREE.Points(gridGeo, gridMat);
    scene.add(gridPoints);

    // 3. Delicate Floating Specular Bokeh Dust
    const DUST_COUNT = 45;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);

    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 22;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1;
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: isLight ? 0x0284c7 : 0x67e8f9,
      size: isLight ? 0.035 : 0.04,
      transparent: true,
      opacity: isLight ? 0.35 : 0.55,
      blending: THREE.AdditiveBlending,
    });

    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 4. Pointer Interaction
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
      // Map to world coordinates approx at z=0
      mouse.targetX = nx * (cols * spacingX * 0.5);
      mouse.targetY = ny * (rows * spacingY * 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 5. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // Update dot grid colors based on distance to cursor spotlight
      const colorsAttr = gridGeo.attributes.color;
      const spotlightRadiusSq = 12.0;

      for (let i = 0; i < totalDots; i++) {
        const px = gridPositions[i * 3];
        const py = gridPositions[i * 3 + 1];

        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const distSq = dx * dx + dy * dy;

        const baseR = gridBaseColors[i * 3];
        const baseG = gridBaseColors[i * 3 + 1];
        const baseB = gridBaseColors[i * 3 + 2];

        if (distSq < spotlightRadiusSq) {
          const t = Math.max(0, 1 - distSq / spotlightRadiusSq);
          // Ease curve
          const intensity = t * t;

          colorsAttr.setXYZ(
            i,
            baseR + (glowColor.r - baseR) * intensity,
            baseG + (glowColor.g - baseG) * intensity,
            baseB + (glowColor.b - baseB) * intensity
          );
        } else {
          // Center subtle ambient pulse
          const centerDistSq = px * px * 0.3 + py * py;
          const centerGlow = Math.max(0, 1 - centerDistSq / 40.0) * 0.25;

          colorsAttr.setXYZ(
            i,
            baseR + (centerColor.r - baseR) * centerGlow,
            baseG + (centerColor.g - baseG) * centerGlow,
            baseB + (centerColor.b - baseB) * centerGlow
          );
        }
      }

      colorsAttr.needsUpdate = true;

      // Gentle floating dust drift
      if (!prefersReduced) {
        dustPoints.position.y = Math.sin(elapsed * 0.3) * 0.2;
        dustPoints.position.x = Math.cos(elapsed * 0.2) * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Handler
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
      gridGeo.dispose();
      gridMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, [resolvedTheme]);

  return <div ref={mountRef} className="hero-rebuild-art antigravity-canvas-container" />;
}
