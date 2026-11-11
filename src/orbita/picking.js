// Raycast sobre los volúmenes de nivel. Mouse: hover resalta, clic entra.
// Táctil: primer toque resalta, segundo toque sobre el mismo nivel entra.
import * as THREE from 'three';

export function createPicker(dom, camera, meshes, { onHover, onSelect }) {
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let current = null;
  let pending = null;
  let down = null;

  const pick = (e) => {
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    return hit ? { ...hit.object.userData, object: hit.object } : null;
  };
  const same = (a, b) => a && b && a.torre === b.torre && a.nivel === b.nivel;
  const setHover = (h, e) => {
    if (!same(h, current) || !h) {
      current = h;
      onHover(h, e);
    } else onHover(h, e, true);
  };

  const move = (e) => {
    if (e.pointerType !== 'mouse' || down) return;
    if (pending) return;
    pending = requestAnimationFrame(() => { pending = null; setHover(pick(e), e); });
  };
  const pdown = (e) => { down = { x: e.clientX, y: e.clientY }; };
  const pup = (e) => {
    const d = down; down = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return;
    const h = pick(e);
    if (!h || h.nivel === 1) { setHover(null, e); return; }
    if (e.pointerType === 'mouse' || same(h, current)) onSelect(h);
    else setHover(h, e);
  };
  const leave = (e) => { if (e.pointerType === 'mouse') setHover(null, e); };

  dom.addEventListener('pointermove', move);
  dom.addEventListener('pointerdown', pdown);
  dom.addEventListener('pointerup', pup);
  dom.addEventListener('pointerleave', leave);
  return {
    clear: () => { current = null; onHover(null); },
    dispose: () => {
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerdown', pdown);
      dom.removeEventListener('pointerup', pup);
      dom.removeEventListener('pointerleave', leave);
    },
  };
}
