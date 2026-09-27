import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const NODES = [
  { name: "Manila", lat: 14.5995, lng: 120.9842, color: 0xE3161B },
  { name: "London", lat: 51.5074, lng: -0.1278, color: 0xFDB95B },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, color: 0x2ECC71 },
  { name: "Ho Chi Minh City", lat: 10.8231, lng: 106.6297, color: 0x4AA3B8 },
];

const ROUTES = [[0, 1], [0, 2], [0, 3]];

function latLngToVec3(lat, lng, r) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function glowTexture(hex) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  const col = `#${hex.toString(16).padStart(6, "0")}`;
  g.addColorStop(0, col);
  g.addColorStop(0.35, col + "cc");
  g.addColorStop(1, col + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export default function Globe({ className = "" }) {
  const mountRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 1024;
    setEnabled(!reduced && !mobile);
  }, []);

  useEffect(() => {
    if (!enabled || !mountRef.current) return;
    const mount = mountRef.current;
    const R = 2;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.6, 6.2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // particle sphere
    const COUNT = 1600;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      positions[i * 3] = R * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = R * Math.cos(phi);
      positions[i * 3 + 2] = R * Math.sin(phi) * Math.sin(theta);
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      pgeo,
      new THREE.PointsMaterial({ color: 0x7fb0d8, size: 0.022, transparent: true, opacity: 0.75 })
    );
    group.add(points);

    // soft inner sphere for occlusion depth
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.985, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x04163a, transparent: true, opacity: 0.88 })
    );
    group.add(inner);

    // nodes + arcs + pulses
    const pulses = [];
    const arcMats = [];
    ROUTES.forEach(([a, b], ri) => {
      const va = latLngToVec3(NODES[a].lat, NODES[a].lng, R * 1.002);
      const vb = latLngToVec3(NODES[b].lat, NODES[b].lng, R * 1.002);
      const mid = va.clone().add(vb).multiplyScalar(0.5);
      const lift = 1 + va.distanceTo(vb) * 0.32;
      mid.normalize().multiplyScalar(R * lift);
      const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(72));
      const mat = new THREE.LineDashedMaterial({
        color: 0xFDB95B, dashSize: 0.14, gapSize: 0.09, transparent: true, opacity: 0.85,
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      arcMats.push(mat);
      group.add(line);

      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xFFD68A })
      );
      pulse.userData = { curve, offset: ri * 0.33 };
      pulses.push(pulse);
      group.add(pulse);
    });

    NODES.forEach((n) => {
      const pos = latLngToVec3(n.lat, n.lng, R * 1.005);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTexture(n.color), transparent: true, depthWrite: false })
      );
      sprite.position.copy(pos);
      sprite.scale.setScalar(0.42);
      group.add(sprite);
    });

    group.rotation.y = -1.85;
    group.rotation.x = 0.28;

    let mouseX = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = -1.85 + t * 0.06 + mouseX;
      arcMats.forEach((m) => (m.dashOffset = -t * 0.35));
      pulses.forEach((p) => {
        const u = (t * 0.18 + p.userData.offset) % 1;
        p.position.copy(p.userData.curve.getPoint(u));
        p.material.opacity = Math.sin(u * Math.PI);
        p.material.transparent = true;
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount.clientWidth) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pgeo.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={mountRef} className={className} aria-hidden="true" data-testid="hero-globe" />;
}
