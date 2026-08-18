"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * Three.js Apple-Style Ambient Fluid Mesh & Specular Glow Canvas:
 * Creates an organic, flowing 3D wave mesh with dynamic lighting and subtle pointer parallax,
 * delivering an ultra-refined Apple/iOS glass aesthetic.
 */
export function HullScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isLight = resolvedTheme !== "dark";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 0.9 : 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(isLight ? 0x0284c7 : 0x38bdf8, isLight ? 1.5 : 2.2);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(isLight ? 0x006399 : 0x0ea5e9, isLight ? 1.2 : 1.8);
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    // 1. Organic Fluid Wave Mesh
    const planeGeo = new THREE.PlaneGeometry(16, 12, 64, 64);
    const planePos = planeGeo.attributes.position;
    const initialZ = new Float32Array(planePos.count);
    for (let i = 0; i < planePos.count; i++) {
      initialZ[i] = planePos.getZ(i);
    }

    const planeMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0x006399 : 0x0284c7,
      emissive: isLight ? 0x0284c7 : 0x003366,
      emissiveIntensity: isLight ? 0.15 : 0.4,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: isLight ? 0.14 : 0.28,
      wireframe: false,
      side: THREE.DoubleSide,
    });

    const waveMesh = new THREE.Mesh(planeGeo, planeMat);
    waveMesh.rotation.x = -Math.PI / 2.6;
    waveMesh.position.set(0, -0.6, 0);
    scene.add(waveMesh);

    // Wireframe overlay for technical depth
    const wireMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0284c7 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.06 : 0.12,
    });
    const wireMesh = new THREE.Mesh(planeGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2.6;
    wireMesh.position.set(0, -0.59, 0);
    scene.add(wireMesh);

    // 2. Specular Ambient Floating Particles
    const PARTICLE_COUNT = 90;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(PARTICLE_COUNT * 3);
    const partScales = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3] = (Math.random() - 0.5) * 14;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      partScales[i] = Math.random() * 0.8 + 0.2;
    }

    partGeo.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));

    const partMat = new THREE.PointsMaterial({
      color: isLight ? 0x006399 : 0x67e8f9,
      size: 0.045,
      transparent: true,
      opacity: isLight ? 0.4 : 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // Mouse Parallax Interaction
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 0.6;
      camera.position.y = 1.8 + mouse.y * 0.4;
      camera.lookAt(0, 0, 0);

      // Animate fluid wave vertex positions
      if (!prefersReduced) {
        const positions = planeGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const u = positions.getX(i);
          const v = positions.getY(i);
          const z =
            Math.sin(u * 0.6 + elapsed * 0.8) * 0.35 +
            Math.cos(v * 0.5 + elapsed * 0.7) * 0.3 +
            Math.sin((u + v) * 0.4 + elapsed * 0.5) * 0.2;
          positions.setZ(i, initialZ[i] + z);
        }
        positions.needsUpdate = true;
        planeGeo.computeVertexNormals();

        // Rotate particles gently
        particles.rotation.y = elapsed * 0.03;
        particles.rotation.x = elapsed * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
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

  return <div ref={mountRef} className="hero-rebuild-art" aria-hidden="true" style={{ pointerEvents: "none" }} />;
}
