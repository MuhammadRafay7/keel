"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The Keel mark in three dimensions: a spine running fore-to-aft with ribs
 * arcing off it to form a hull. Drag to orbit.
 *
 * Written against three.js directly rather than react-three-fiber — this is one
 * scene with no React state in it, so the reconciler would cost two dependencies
 * and a React 19 requirement while buying nothing.
 */
export function HullScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(6.5, 2.6, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    const hull = new THREE.Group();
    scene.add(hull);

    const ACCENT = new THREE.Color("#4fa8bc");
    const DIM = new THREE.Color("#2b4954");

    // The spine.
    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.35, -4.6),
      new THREE.Vector3(0, -0.35, -1.6),
      new THREE.Vector3(0, -0.55, 1.2),
      new THREE.Vector3(0, -0.05, 4.2),
    ]);
    const spine = new THREE.Mesh(
      new THREE.TubeGeometry(spineCurve, 80, 0.075, 12, false),
      new THREE.MeshBasicMaterial({ color: ACCENT })
    );
    hull.add(spine);

    // Ribs, arcing off the spine. Beam tapers toward bow and stern, the way a
    // real hull narrows — that variation is what reads as a ship rather than a
    // stack of hoops.
    const RIB_COUNT = 17;
    const ribs: THREE.Line[] = [];
    for (let i = 0; i < RIB_COUNT; i++) {
      const t = i / (RIB_COUNT - 1);
      const z = -4.4 + t * 8.6;
      const taper = Math.sin(Math.PI * t) ** 0.75;
      const beam = 0.35 + taper * 2.05;
      const depth = 0.3 + taper * 1.5;
      const base = spineCurve.getPoint(t).y;

      const pts: THREE.Vector3[] = [];
      const SEG = 44;
      for (let s = 0; s <= SEG; s++) {
        const a = (s / SEG) * Math.PI;
        pts.push(new THREE.Vector3(Math.cos(a) * beam, base + Math.sin(a) * depth * 0.62, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: DIM.clone().lerp(ACCENT, taper),
        transparent: true,
        opacity: 0.35 + taper * 0.5,
      });
      const rib = new THREE.Line(geo, mat);
      ribs.push(rib);
      hull.add(rib);
    }

    // Waterline — a faint ellipse the hull sits in.
    const wl: THREE.Vector3[] = [];
    for (let s = 0; s <= 128; s++) {
      const a = (s / 128) * Math.PI * 2;
      wl.push(new THREE.Vector3(Math.cos(a) * 2.5, -0.62, Math.sin(a) * 4.9));
    }
    hull.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(wl),
        new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.16 })
      )
    );

    // Orbit, hand-rolled: two angles, damped. Cheaper than pulling in OrbitControls.
    let targetAzimuth = 0.35;
    let azimuth = 0.35;
    let targetPolar = 0.28;
    let polar = 0.28;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetAzimuth += (e.clientX - lastX) * 0.006;
      targetPolar = Math.max(-0.45, Math.min(0.9, targetPolar + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
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
    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const elapsed = (performance.now() - start) / 1000;

      if (!dragging && !prefersReduced) targetAzimuth += 0.0016;

      azimuth += (targetAzimuth - azimuth) * 0.07;
      polar += (targetPolar - polar) * 0.07;

      const r = 10.4;
      camera.position.set(
        Math.sin(azimuth) * r * Math.cos(polar),
        1.9 + Math.sin(polar) * r * 0.55,
        Math.cos(azimuth) * r * Math.cos(polar)
      );
      camera.lookAt(0, -0.1, 0);

      if (!prefersReduced) {
        // A slow swell through the ribs, fore to aft.
        ribs.forEach((rib, i) => {
          const phase = elapsed * 0.9 - i * 0.24;
          const m = rib.material as THREE.LineBasicMaterial;
          const t = i / (RIB_COUNT - 1);
          const taper = Math.sin(Math.PI * t) ** 0.75;
          m.opacity = 0.3 + taper * 0.45 + Math.sin(phase) * 0.14;
        });
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
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="hull-canvas" aria-hidden="true" />;
}
