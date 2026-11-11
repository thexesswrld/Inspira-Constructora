// Entorno estilo maqueta: terreno, plaza, jardín, alberca, calles, árboles y manzanas vecinas.
import * as THREE from 'three';
import { rng } from '../data/generate.js';

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, ...extra });

function box(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y + h / 2, z);
  m.receiveShadow = true;
  return m;
}

// Rectángulos (centro x,z + medidas) que deben quedar libres de árboles.
function inside(x, z, rects, pad = 0) {
  return rects.some((r) => Math.abs(x - r.x) < r.w / 2 + pad && Math.abs(z - r.z) < r.d / 2 + pad);
}

export function buildEntorno(torres) {
  const g = new THREE.Group();
  const rand = rng(42);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(700, 64), mat(0xd6cdb4));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  g.add(ground);

  // Calles alrededor del predio
  const road = mat(0x8f8b84);
  g.add(box(230, 0.1, 12, road, 0, 0, 72));
  g.add(box(230, 0.1, 12, road, 0, 0, -86));
  g.add(box(12, 0.1, 170, road, -109, 0, -7));
  g.add(box(12, 0.1, 170, road, 109, 0, -7));

  // Predio: plaza, jardín central, alberca, andadores
  g.add(box(206, 0.6, 146, mat(0xe9e2d3), 0, 0, -7));
  g.add(box(96, 0.12, 54, mat(0x93b06f), 0, 0.6, 30));
  g.add(box(40, 0.18, 18, mat(0xf3eee4), 0, 0.6, 30));
  g.add(box(34, 0.2, 12, mat(0x56aecb, { roughness: 0.15, metalness: 0.1, emissive: 0x0d3b4d, emissiveIntensity: 0.25 }), 0, 0.62, 30));
  const path = mat(0xd9c6a2);
  g.add(box(6, 0.14, 40, path, 0, 0.6, 48));
  g.add(box(150, 0.14, 5, path, 0, 0.6, 8));
  g.add(box(14, 0.14, 4, mat(0xc2673a), 0, 0.6, 66));

  // Manzanas vecinas (contexto urbano sencillo)
  const blocks = new THREE.Group();
  const bMat = mat(0xddd6c8);
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = 150 + rand() * 170;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const w = 14 + rand() * 22, d = 14 + rand() * 22, h = 4 + rand() * (rand() > 0.85 ? 34 : 14);
    const b = box(w, h, d, bMat, x, 0, z);
    b.rotation.y = Math.round(rand()) * 0.03;
    b.castShadow = true;
    blocks.add(b);
  }
  g.add(blocks);

  // Árboles instanciados
  const busy = [
    ...torres.map((t) => ({ x: t.pos.x, z: t.pos.z, w: 34, d: 26 })),
    { x: 0, z: 30, w: 42, d: 20 },
  ];
  const spots = [];
  while (spots.length < 90) {
    const x = (rand() - 0.5) * 200;
    const z = -78 + rand() * 142;
    if (inside(x, z, busy, 3)) continue;
    if (Math.abs(x) < 5 && z > 28) continue;
    spots.push([x, z, 0.75 + rand() * 0.6]);
  }
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1;
    spots.push([-104 + (i >> 1) * 11, side > 0 ? 80 : -94, 0.9 + rand() * 0.3]);
  }

  const crownGeo = new THREE.IcosahedronGeometry(2.6, 0);
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 2.6, 6);
  const crowns = new THREE.InstancedMesh(crownGeo, mat(0xffffff, { flatShading: true }), spots.length);
  const trunks = new THREE.InstancedMesh(trunkGeo, mat(0x7b5e45), spots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const greens = [0x6f9a52, 0x7fa85e, 0x5d8a48, 0x8db069, 0xa0a35a].map((c) => new THREE.Color(c));
  spots.forEach(([x, z, k], i) => {
    p.set(x, 0.6 + 1.3 * k, z); s.set(k, k, k); q.identity();
    trunks.setMatrixAt(i, m4.compose(p, q, s));
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6);
    p.set(x, 0.6 + 3.9 * k, z); s.set(k, k * (1 + rand() * 0.5), k);
    crowns.setMatrixAt(i, m4.compose(p, q, s));
    crowns.setColorAt(i, greens[i % greens.length]);
  });
  crowns.castShadow = trunks.castShadow = true;
  g.add(crowns, trunks);
  return g;
}
