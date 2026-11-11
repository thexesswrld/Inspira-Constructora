// Vista "órbita": conjunto en 3D. Se monta una sola vez y se pausa al salir.
import * as THREE from 'three';
import gsap from 'gsap';
import { createScene, hasWebGL, HOME, homePosition } from './scene.js';
import { buildTorre, DIM } from './torres.js';
import { buildEntorno } from './entorno.js';
import { createLabels } from './etiquetas.js';
import { createPicker } from './picking.js';
import { unitsOfTower, unitsOnLevel, countByStatus } from '../lib/units.js';
import { legendHTML } from '../ui/disponibilidad.js';

const panelHTML = (data, counts) => `
  <p class="eyebrow">${data.desarrollo.ubicacion}</p>
  <h1 class="orb-title">${data.desarrollo.nombre}</h1>
  <p class="orb-sub">${data.torres.length} torres · ${data.unidades.length} residencias · entrega ${data.desarrollo.entrega}</p>
  ${legendHTML(counts)}
  <ol class="orb-steps">
    <li><b>Gira el conjunto.</b> Arrastra para rotar; con la rueda o pellizcando te acercas.</li>
    <li><b>Elige un nivel.</b> Pasa sobre una torre y toca el piso que te interesa.</li>
    <li><b>Explora y cotiza.</b> Abre cualquier departamento disponible.</li>
  </ol>`;

function fallbackHTML(data) {
  return `<div class="orb-fallback">
    <h2>Tu navegador no muestra 3D</h2>
    <p>Elige una torre y un nivel para ver el plano.</p>
    ${data.torres.map((t) => {
      const c = countByStatus(unitsOfTower(data.unidades, t.id));
      return `<div class="fb-torre"><h3>${t.nombre} <small>${c.disponible} disponibles</small></h3>
        <div class="fb-niveles">${Array.from({ length: t.niveles - 1 }, (_, i) => i + 2)
          .map((n) => `<a href="#/torre/${t.id}/${n}">${n}</a>`).join('')}</div></div>`;
    }).join('')}
  </div>`;
}

export function mountOrbita(root, { data, go }) {
  root.innerHTML = `<div class="orb">
    <div class="orb-canvas"></div>
    <div class="orb-labels"></div>
    <aside class="orb-panel"></aside>
    <div class="orb-tip" hidden></div>
    <p class="orb-hint">Arrastra para girar · Toca un nivel para entrar</p>
  </div>`;
  const el = root.firstElementChild;
  const panel = el.querySelector('.orb-panel');
  panel.innerHTML = panelHTML(data, countByStatus(data.unidades));

  if (!hasWebGL()) {
    el.querySelector('.orb-canvas').innerHTML = fallbackHTML(data);
    el.querySelector('.orb-hint').remove();
    return { show() {}, hide() {} };
  }

  let s;
  try {
    s = createScene(el.querySelector('.orb-canvas'));
  } catch (err) {
    console.warn('órbita: WebGL falló', err);
    el.querySelector('.orb-canvas').innerHTML = fallbackHTML(data);
    return { show() {}, hide() {} };
  }

  s.scene.add(buildEntorno(data.torres));
  const torres = {};
  const meshes = [];
  for (const t of data.torres) {
    const built = buildTorre(t);
    s.scene.add(built.group);
    torres[t.id] = { ...built, data: t };
    meshes.push(...built.levelMeshes);
  }

  // Resalte del nivel bajo el cursor
  const hl = new THREE.Mesh(
    new THREE.BoxGeometry(DIM.W + 0.5, DIM.H - 0.2, DIM.D + 0.5),
    new THREE.MeshBasicMaterial({ color: 0xc2673a, transparent: true, opacity: 0.55, depthWrite: false }),
  );
  hl.visible = false;
  s.scene.add(hl);

  // Etiquetas
  const labelLayer = el.querySelector('.orb-labels');
  const labels = createLabels(labelLayer, data.torres.map((t) => {
    const c = countByStatus(unitsOfTower(data.unidades, t.id));
    return {
      href: `#/torre/${t.id}/${t.niveles}`,
      anchor: new THREE.Vector3(t.pos.x, torres[t.id].height + 7, t.pos.z),
      html: `<b>${t.nombre}</b><span>${t.niveles} niveles · <i class="dot dot-disponible"></i>${c.disponible} disp.</span>`,
    };
  }));
  const canvas = s.renderer.domElement;
  s.onAfterRender(() => labels.update(s.camera, canvas.clientWidth, canvas.clientHeight));

  // Tooltip + picking
  const tip = el.querySelector('.orb-tip');
  const showTip = (h, e) => {
    if (!h) { tip.hidden = true; return; }
    if (h.nivel === 1) {
      tip.innerHTML = `<b>${torres[h.torre].data.nombre} · Planta baja</b><span>Lobby y comercio</span>`;
    } else {
      const c = countByStatus(unitsOnLevel(data.unidades, h.torre, h.nivel));
      const touch = e && e.pointerType !== 'mouse';
      tip.innerHTML = `<b>${torres[h.torre].data.nombre} · Nivel ${h.nivel}</b>
        <span><i class="dot dot-disponible"></i>${c.disponible} disponibles · ${c.apartada} apartados</span>
        <em>${touch ? 'Toca de nuevo para ver el plano' : 'Clic para ver el plano'}</em>`;
    }
    tip.hidden = false;
    if (e) {
      const r = el.getBoundingClientRect();
      tip.style.transform = `translate(${e.clientX - r.left + 16}px, ${e.clientY - r.top + 16}px)`;
    }
  };
  const picker = createPicker(canvas, s.camera, meshes, {
    onHover: (h, e, moveOnly) => {
      canvas.style.cursor = h && h.nivel > 1 ? 'pointer' : '';
      showTip(h, e);
      if (moveOnly) return;
      if (h) {
        hl.position.setFromMatrixPosition(h.object.matrixWorld);
        hl.quaternion.copy(torres[h.torre].group.quaternion);
        hl.visible = true;
      } else hl.visible = false;
      s.requestRender();
    },
    onSelect: (h) => flyTo(h),
  });

  let flying = null;
  function flyTo({ torre, nivel }) {
    if (flying) return;
    const t = torres[torre];
    const target = new THREE.Vector3(t.data.pos.x, (nivel - 0.5) * DIM.H, t.data.pos.z);
    const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(t.group.quaternion);
    const pos = target.clone().addScaledVector(dir, 70).add(new THREE.Vector3(0, 14, 0));
    s.controls.autoRotate = false;
    s.controls.enabled = false;
    tip.hidden = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    flying = gsap.timeline({
      defaults: { duration: reduce ? 0.01 : 1.1, ease: 'power3.inOut', onUpdate: s.requestRender },
      onComplete: () => { flying = null; s.controls.enabled = true; go(`#/torre/${torre}/${nivel}`); },
    })
      .to(s.camera.position, { x: pos.x, y: pos.y, z: pos.z }, 0)
      .to(s.controls.target, { x: target.x, y: target.y, z: target.z }, 0);
  }

  function goHome() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const home = homePosition(s.camera.aspect);
    gsap.timeline({ defaults: { duration: reduce ? 0.01 : 1.4, ease: 'power3.out', onUpdate: s.requestRender } })
      .to(s.camera.position, { x: home.x, y: home.y, z: home.z }, 0)
      .to(s.controls.target, { x: HOME.target.x, y: HOME.target.y, z: HOME.target.z }, 0);
  }

  let zoomedIn = false;
  const intro = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(s.camera.position, { x: 40, y: 260, z: 300, duration: 2.4, ease: 'power3.out', onUpdate: s.requestRender });
    gsap.from(panel.children, { y: 20, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.3 });
    gsap.from(labelLayer, { opacity: 0, duration: 0.8, delay: 1.4 });
  };
  intro();

  return {
    show() {
      s.setActive(true);
      if (zoomedIn) { goHome(); zoomedIn = false; }
    },
    hide() {
      zoomedIn = true;
      picker.clear();
      s.setActive(false);
    },
  };
}
