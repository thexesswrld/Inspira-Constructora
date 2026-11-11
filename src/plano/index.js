// Vista "nivel": plano SVG + riel de niveles + ficha de unidad.
import gsap from 'gsap';
import { planoSVG } from './plano.js';
import { unitsOnLevel, countByStatus, findUnit, ESTADO_LABEL } from '../lib/units.js';
import { money } from '../lib/format.js';
import { legendHTML } from '../ui/disponibilidad.js';
import { railHTML } from '../ui/selector-nivel.js';
import { renderFicha } from '../ui/ficha.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountNivel(root, { data, go }) {
  root.innerHTML = `<div class="lv" hidden>
    <aside class="lv-side">
      <a class="lv-back" href="#/orbita">← Volver al conjunto</a>
      <div class="lv-towers" role="tablist" aria-label="Torres"></div>
      <p class="eyebrow lv-torre"></p>
      <h2 class="lv-title"></h2>
      <div class="lv-legend"></div>
      <p class="lv-help">Toca un departamento para ver su ficha y cotizar.</p>
    </aside>
    <div class="lv-plan"></div>
    <nav class="lv-rail" aria-label="Niveles"></nav>
    <aside class="lv-card" hidden></aside>
    <div class="lv-tip" hidden></div>
  </div>`;
  const el = root.firstElementChild;
  const q = (s) => el.querySelector(s);
  const plan = q('.lv-plan'), card = q('.lv-card'), tip = q('.lv-tip');
  let cur = { torre: null, nivel: null, unidad: null };
  let vertical = false;
  const isPortrait = () => plan.clientHeight > plan.clientWidth * 1.15;

  // Si cambia la orientación del área del plano, se redibuja girado o no.
  new ResizeObserver(() => {
    if (el.hidden || cur.torre == null || isPortrait() === vertical) return;
    vertical = isPortrait();
    plan.innerHTML = planoSVG(unitsOnLevel(data.unidades, cur.torre, cur.nivel), data.tipologias, cur.unidad, { vertical });
  }).observe(plan);

  function openCard(id) {
    const u = findUnit(data.unidades, id);
    if (!u) return;
    plan.querySelectorAll('.pl-u.is-sel').forEach((n) => n.classList.remove('is-sel'));
    plan.querySelector(`.pl-u[data-id="${id}"]`)?.classList.add('is-sel');
    renderFicha(card, u, data);
    const wasHidden = card.hidden;
    card.hidden = false;
    if (wasHidden && !reduce()) gsap.fromTo(card, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
  }
  function closeCard() {
    card.hidden = true;
    plan.querySelectorAll('.pl-u.is-sel').forEach((n) => n.classList.remove('is-sel'));
  }

  card.addEventListener('click', (e) => {
    if (e.target.closest('.fc-close')) go(`#/torre/${cur.torre}/${cur.nivel}`);
  });

  const unitFromEvent = (e) => e.target.closest?.('.pl-u');
  plan.addEventListener('click', (e) => {
    const g = unitFromEvent(e);
    if (!g || g.dataset.estado === 'vendida') return;
    go(`#/unidad/${g.dataset.id}`);
  });
  plan.addEventListener('keydown', (e) => {
    const g = unitFromEvent(e);
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  plan.addEventListener('pointermove', (e) => {
    const g = unitFromEvent(e);
    if (!g || e.pointerType !== 'mouse') { tip.hidden = true; return; }
    const u = findUnit(data.unidades, g.dataset.id);
    const t = data.tipologias.find((x) => x.id === u.tipo);
    tip.innerHTML = `<b>${u.id} · ${t.nombre}</b><span>${u.m2} m² · ${u.rec} rec · ${money(u.precio)}</span><em class="st-${u.estado}">${ESTADO_LABEL[u.estado]}</em>`;
    const r = el.getBoundingClientRect();
    tip.style.transform = `translate(${e.clientX - r.left + 16}px, ${e.clientY - r.top + 16}px)`;
    tip.hidden = false;
  });
  plan.addEventListener('pointerleave', () => { tip.hidden = true; });

  function renderLevel(torreId, nivel, dir) {
    const torre = data.torres.find((t) => t.id === torreId);
    const units = unitsOnLevel(data.unidades, torreId, nivel);
    q('.lv-towers').innerHTML = data.torres.map((t) => {
      const n = Math.min(nivel, t.niveles);
      return `<a role="tab" href="#/torre/${t.id}/${n}" aria-selected="${t.id === torreId}" class="${t.id === torreId ? 'is-on' : ''}">${t.nombre.replace('Torre ', 'T')}</a>`;
    }).join('');
    q('.lv-torre').textContent = `${torre.nombre} · ${data.desarrollo.nombre}`;
    q('.lv-title').textContent = `Nivel ${nivel}`;
    q('.lv-legend').innerHTML = legendHTML(countByStatus(units));
    q('.lv-rail').innerHTML = railHTML(data, torre, nivel);
    vertical = isPortrait();
    plan.innerHTML = planoSVG(units, data.tipologias, cur.unidad, { vertical });
    if (!reduce()) {
      gsap.fromTo(plan.querySelector('svg'), { opacity: 0, y: dir * 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
      gsap.from(plan.querySelectorAll('.pl-u'), { opacity: 0, duration: 0.5, stagger: 0.04, delay: 0.1 });
    }
    q('.lv-rail .is-on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  return {
    show(route) {
      const firstShow = el.hidden;
      el.hidden = false;
      const levelChanged = route.torre !== cur.torre || route.nivel !== cur.nivel;
      if (levelChanged) {
        const dir = cur.nivel == null ? 1 : route.nivel > cur.nivel ? 1 : -1;
        renderLevel(route.torre, route.nivel, dir);
      }
      if (firstShow && !reduce()) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      if (route.unidad) openCard(route.unidad); else closeCard();
      cur = { ...route };
    },
    hide() {
      el.hidden = true;
      tip.hidden = true;
      cur = { torre: null, nivel: null, unidad: null };
    },
  };
}
