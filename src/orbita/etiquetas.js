// Etiquetas HTML que siguen a un punto 3D (nombre de torre, niveles, disponibles).
import * as THREE from 'three';

export function createLabels(layer, items) {
  const v = new THREE.Vector3();
  const els = items.map((it) => {
    const el = document.createElement('a');
    el.className = 'tw-label';
    el.href = it.href;
    el.innerHTML = it.html;
    layer.appendChild(el);
    return { el, anchor: it.anchor };
  });
  return {
    update(camera, w, h) {
      for (const { el, anchor } of els) {
        v.copy(anchor).project(camera);
        const visible = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
        el.style.opacity = visible ? '' : '0';
        el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -100%)`;
      }
    },
  };
}
