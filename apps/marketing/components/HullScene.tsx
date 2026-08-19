"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * Three.js Apple-Style Interactive Ambient Fluid Wave Canvas:
 * Features cursor-driven 3D fluid wave ripples, interactive mouse lighting,
 * smooth drag-to-orbit tilting, and floating specular ambient particles.
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
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 2.2, 7.8);
    camera.lookAt(0, 0, 0);

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

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.95 : 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(isLight ? 0x0284c7 : 0x38bdf8, isLight ? 1.6 : 2.4);
    dirLight1.position.set(5, 6, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(isLight ? 0x006399 : 0x0ea5e9, isLight ? 1.2 : 1.8);
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    // Interactive Cursor Spotlight
    const cursorLight = new THREE.PointLight(isLight ? 0x38bdf8 : 0x67e8f9, isLight ? 3.0 : 4.5, 9);
    cursorLight.position.set(0, 1, 3);
    scene.add(cursorLight);

    // 3. Organic Fluid Wave Mesh
    const planeGeo = new THREE.PlaneGeometry(18, 14, 80, 80);
    const planePos = planeGeo.attributes.position;
    const initialZ = new Float32Array(planePos.count);
    const initialX = new Float32Array(planePos.count);
    const initialY = new Float32Array(planePos.count);

    for (let i = 0; i < planePos.count; i++) {
      initialX[i] = planePos.getX(i);
      initialY[i] = planePos.getY(i);
      initialZ[i] = planePos.getZ(i);
    }

    const planeMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0x006399 : 0x0284c7,
      emissive: isLight ? 0x0284c7 : 0x003366,
      emissiveIntensity: isLight ? 0.18 : 0.45,
      roughness: 0.18,
      metalness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: isLight ? 0.16 : 0.32,
      side: THREE.DoubleSide,
    });

    const waveMesh = new THREE.Mesh(planeGeo, planeMat);
    waveMesh.rotation.x = -Math.PI / 2.5;
    waveMesh.position.set(0, -0.6, 0);
    scene.add(waveMesh);

    // Technical Wireframe Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0284c7 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.07 : 0.14,
    });
    const wireMesh = new THREE.Mesh(planeGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2.5;
    wireMesh.position.set(0, -0.59, 0);
    scene.add(wireMesh);

    // 4. Floating Specular Particles
    const PARTICLE_COUNT = 100;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 15;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }

    partGeo.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));

    const partMat = new THREE.PointsMaterial({
      color: isLight ? 0x006399 : 0x67e8f9,
      size: 0.05,
      transparent: true,
      opacity: isLight ? 0.45 : 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // 5. Interactive Cursor & Drag Handlers
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      isDragging: false,
      prevX: 0,
      prevY: 0,
      rotX: 0,
      rotY: 0,
      targetRotX: 0,
      targetRotY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouse.targetX = nx;
      mouse.targetY = ny;

      if (mouse.isDragging) {
        const deltaX = e.clientX - mouse.prevX;
        const deltaY = e.clientY - mouse.prevY;
        mouse.targetRotY += deltaX * 0.005;
        mouse.targetRotX += deltaY * 0.005;
        mouse.prevX = e.clientX;
        mouse.prevY = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouse.isDragging = true;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
    };

    const handleMouseUp = () => {
      mouse.isDragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      mouse.rotX += (mouse.targetRotX - mouse.rotX) * 0.08;
      mouse.rotY += (mouse.targetRotY - mouse.rotY) * 0.08;

      // Update Cursor Light Position in 3D Space
      cursorLight.position.x = mouse.x * 4.5;
      cursorLight.position.y = mouse.y * 2.5 + 0.5;
      cursorLight.position.z = 2.5;

      // Camera Parallax with Drag Rotation
      camera.position.x = mouse.x * 0.8;
      camera.position.y = 2.2 + mouse.y * 0.5;
      camera.position.z = 7.8;

      waveMesh.rotation.z = mouse.rotY * 0.4;
      wireMesh.rotation.z = mouse.rotY * 0.4;
      waveMesh.rotation.y = mouse.rotY * 0.3;
      wireMesh.rotation.y = mouse.rotY * 0.3;

      camera.lookAt(0, 0, 0);

      // Animate Fluid Wave Vertices with Cursor Proximity Ripples
      if (!prefersReduced) {
        const positions = planeGeo.attributes.position;
        // Project mouse position onto plane coords
        const cursorPlaneX = mouse.x * 6;
        const cursorPlaneY = mouse.y * 4;

        for (let i = 0; i < positions.count; i++) {
          const u = initialX[i];
          const v = initialY[i];

          // Natural undulating wave
          const waveZ =
            Math.sin(u * 0.55 + elapsed * 0.9) * 0.38 +
            Math.cos(v * 0.48 + elapsed * 0.75) * 0.32 +
            Math.sin((u + v) * 0.35 + elapsed * 0.6) * 0.22;

          // Interactive cursor ripple displacement
          const distSq = (u - cursorPlaneX) ** 2 + (v - cursorPlaneY) ** 2;
          const ripple = Math.exp(-distSq / 4.5) * Math.sin(Math.sqrt(distSq) * 3.5 - elapsed * 4.0) * 0.45;

          positions.setZ(i, initialZ[i] + waveZ + ripple);
        }
        positions.needsUpdate = true;
        planeGeo.computeVertexNormals();

        // Rotate ambient particles gently
        particles.rotation.y = elapsed * 0.03 + mouse.x * 0.1;
        particles.rotation.x = elapsed * 0.015 + mouse.y * 0.08;
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
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      planeGeo.dispose();
      planeMat.dispose();
      wireMat.dispose();
      partGeo.dispose();
      partMat.dispose();
      renderer.dispose();
    };
  }, [resolvedTheme]);

  return <div ref={mountRef} className="hero-rebuild-art antigravity-canvas-container" />;
}
