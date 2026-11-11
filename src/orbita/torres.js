// Torres generadas por código: un volumen por nivel (para poder señalar niveles),
// losas con vuelo, barandales de vidrio, lobby acristalado y azotea.
import * as THREE from 'three';

export const DIM = { W: 26, D: 16, H: 3.2 };

function facadeTexture(cols, { lobby = false } = {}) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = lobby ? '#2f3a44' : '#efe8dc';
  g.fillRect(0, 0, 512, 128);
  const cw = 512 / cols;
  for (let i = 0; i < cols; i++) {
    const x = i * cw + cw * 0.12;
    const w = cw * 0.76;
    const y = lobby ? 10 : 18;
    const h = lobby ? 112 : 92;
    const grad = g.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, lobby ? '#8fb2c4' : '#6e8597');
    grad.addColorStop(1, lobby ? '#4e6a7a' : '#34424f');
    g.fillStyle = grad;
    g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(x, y, w * 0.35, h);
    g.fillStyle = lobby ? '#2b2724' : '#d8cfc0';
    g.fillRect(x + w / 2 - 2, y, 4, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

let shared;
function materials() {
  if (shared) return shared;
  const plain = new THREE.MeshStandardMaterial({ color: 0xece5d8, roughness: 0.9 });
  const front = new THREE.MeshStandardMaterial({ map: facadeTexture(7), roughness: 0.75 });
  const side = new THREE.MeshStandardMaterial({ map: facadeTexture(4), roughness: 0.75 });
  const lobbyF = new THREE.MeshStandardMaterial({ map: facadeTexture(7, { lobby: true }), roughness: 0.4, metalness: 0.1 });
  const lobbyS = new THREE.MeshStandardMaterial({ map: facadeTexture(4, { lobby: true }), roughness: 0.4, metalness: 0.1 });
  shared = {
    body: [side, side, plain, plain, front, front],
    lobby: [lobbyS, lobbyS, plain, plain, lobbyF, lobbyF],
    slab: new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.85 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xbfd6e0, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.2, depthWrite: false }),
    roof: new THREE.MeshStandardMaterial({ color: 0xd9d1c3, roughness: 0.95 }),
    accent: new THREE.MeshStandardMaterial({ color: 0xc2673a, roughness: 0.7 }),
  };
  return shared;
}

export function buildTorre(torre) {
  const { W, D, H } = DIM;
  const m = materials();
  const group = new THREE.Group();
  group.name = torre.id;
  const levelMeshes = [];

  const bodyGeo = new THREE.BoxGeometry(W, H - 0.35, D);
  const slabGeo = new THREE.BoxGeometry(W + 2.2, 0.35, D + 2.2);
  const railGeo = new THREE.BoxGeometry(W + 2.2, 1.05, 0.08);

  for (let nivel = 1; nivel <= torre.niveles; nivel++) {
    const y0 = (nivel - 1) * H;
    const body = new THREE.Mesh(bodyGeo, nivel === 1 ? m.lobby : m.body);
    body.position.y = y0 + (H - 0.35) / 2;
    body.castShadow = body.receiveShadow = true;
    body.userData = { torre: torre.id, nivel };
    group.add(body);
    levelMeshes.push(body);

    const slab = new THREE.Mesh(slabGeo, m.slab);
    slab.position.y = y0 + H - 0.175;
    slab.castShadow = slab.receiveShadow = true;
    group.add(slab);

    if (nivel > 1) {
      for (const z of [D / 2 + 1.06, -D / 2 - 1.06]) {
        const rail = new THREE.Mesh(railGeo, m.glass);
        rail.position.set(0, y0 + 0.52, z);
        group.add(rail);
      }
    }
  }

  // Marco vertical en esquinas (ritmo de fachada) y azotea
  const total = torre.niveles * H;
  const finGeo = new THREE.BoxGeometry(0.7, total + 1.2, 0.7);
  for (const x of [-W / 2 - 1.1, W / 2 + 1.1]) {
    for (const z of [D / 2 + 1.1, -D / 2 - 1.1]) {
      const fin = new THREE.Mesh(finGeo, m.slab);
      fin.position.set(x, (total + 1.2) / 2, z);
      fin.castShadow = true;
      group.add(fin);
    }
  }
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(W + 2.2, 1.1, D + 2.2), m.roof);
  parapet.position.y = total + 0.55;
  parapet.castShadow = true;
  group.add(parapet);
  const room = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 6), m.roof);
  room.position.set(-5, total + 1.6, -2);
  room.castShadow = true;
  group.add(room);
  const pergola = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 6), m.accent);
  pergola.position.set(6, total + 3, 2);
  pergola.castShadow = true;
  group.add(pergola);

  group.position.set(torre.pos.x, 0.6, torre.pos.z);
  group.rotation.y = torre.pos.rot || 0;
  return { group, levelMeshes, height: total };
}
