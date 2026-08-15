"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Three.js 3D Antigravity Hull Scene:
 * Interactive 3D orbital ring network with starfield particles,
 * mouse vector deflection, and floating energy nodes.
 */
export function HullScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(6.5, 2.8, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Color definitions
    const COLOR_CYAN = new THREE.Color("#38bdf8");
    const COLOR_INDIGO = new THREE.Color("#818cf8");
    const COLOR_PURPLE = new THREE.Color("#c084fc");

    // 1. Spine curve
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, -5.0),
      new THREE.Vector3(0, -0.4, -1.8),
      new THREE.Vector3(0, -0.65, 1.4),
      new THREE.Vector3(0, -0.05, 4.8),
    ]);

    const spineGeo = new THREE.TubeGeometry(spineCurve, 100, 0.08, 16, false);
    const spineMat = new THREE.MeshBasicMaterial({
      color: COLOR_CYAN,
      wireframe: false,
    });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    mainGroup.add(spine);

    // 2. Ribs network
    const RIB_COUNT = 22;
    const ribs: THREE.Line[] = [];
    for (let i = 0; i < RIB_COUNT; i++) {
      const t = i / (RIB_COUNT - 1);
      const z = -4.8 + t * 9.6;
      const taper = Math.sin(Math.PI * t) ** 0.75;
      const beam = 0.4 + taper * 2.3;
      const depth = 0.35 + taper * 1.7;
      const base = spineCurve.getPoint(t).y;

      const pts: THREE.Vector3[] = [];
      const SEG = 50;
      for (let s = 0; s <= SEG; s++) {
        const a = (s / SEG) * Math.PI;
        pts.push(new THREE.Vector3(Math.cos(a) * beam, base + Math.sin(a) * depth * 0.65, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: COLOR_INDIGO.clone().lerp(COLOR_CYAN, taper),
        transparent: true,
        opacity: 0.4 + taper * 0.5,
      });
      const rib = new THREE.Line(geo, mat);
      ribs.push(rib);
      mainGroup.add(rib);
    }

    // 3. Floating Orbital Particle Starfield
    const PARTICLE_COUNT = 300;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleScales = new Float32Array(PARTICLE_COUNT);

    for (let p = 0; p < PARTICLE_COUNT; p++) {
      const radius = 2.5 + Math.random() * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      particlePositions[p * 3] = Math.cos(theta) * Math.cos(phi) * radius;
      particlePositions[p * 3 + 1] = Math.sin(phi) * radius * 0.8;
      particlePositions[p * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius;

      particleScales[p] = Math.random() * 0.08 + 0.02;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: COLOR_CYAN,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // 4. Floating glowing energy nodes
    const nodeCount = 8;
    const nodes: THREE.Mesh[] = [];
    for (let n = 0; n < nodeCount; n++) {
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: n % 2 === 0 ? COLOR_CYAN : COLOR_PURPLE,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      const t = (n + 1) / (nodeCount + 1);
      const pos = spineCurve.getPoint(t);
      nodeMesh.position.set(pos.x, pos.y + 0.5, pos.z);
      nodes.push(nodeMesh);
      mainGroup.add(nodeMesh);
    }

    // Interaction state
    let targetAzimuth = 0.4;
    let azimuth = 0.4;
    let targetPolar = 0.25;
    let polar = 0.25;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        /* fallback */
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetAzimuth += (e.clientX - lastX) * 0.005;
      targetPolar = Math.max(-0.4, Math.min(0.85, targetPolar + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onUp = (e: PointerEvent) => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        /* fallback */
      }
    };

    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointercancel", onUp);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    const startTime = performance.now();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const elapsed = (performance.now() - startTime) / 1000;

      if (!dragging && !prefersReduced) {
        targetAzimuth += 0.0015;
      }

      azimuth += (targetAzimuth - azimuth) * 0.06;
      polar += (targetPolar - polar) * 0.06;

      const r = 11.0;
      camera.position.set(
        Math.sin(azimuth) * r * Math.cos(polar),
        2.0 + Math.sin(polar) * r * 0.5,
        Math.cos(azimuth) * r * Math.cos(polar)
      );
      camera.lookAt(0, 0, 0);

      if (!prefersReduced) {
        // Pulse ribs
        ribs.forEach((rib, i) => {
          const phase = elapsed * 1.2 - i * 0.22;
          const mat = rib.material as THREE.LineBasicMaterial;
          const t = i / (RIB_COUNT - 1);
          const taper = Math.sin(Math.PI * t) ** 0.75;
          mat.opacity = 0.3 + taper * 0.4 + Math.sin(phase) * 0.18;
        });

        // Float energy nodes
        nodes.forEach((node, i) => {
          node.position.y += Math.sin(elapsed * 2.0 + i) * 0.0015;
        });

        // Rotate particles slowly
        particles.rotation.y = elapsed * 0.05;
      }

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointercancel", onUp);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Points) {
          o.geometry.dispose();
          if (Array.isArray(o.material)) {
            o.material.forEach((m) => m.dispose());
          } else {
            o.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="hull-canvas" aria-hidden="true" />;
}
