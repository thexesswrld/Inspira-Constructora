// Contenido de la landing que sale de data.json (tipologías, amenidades) + ventanas del skyline.
import { rng } from '../data/generate.js';
import { interiorSVG, balconyRect } from '../plano/layout.js';
import { money, m2 } from '../lib/format.js';

const SVGNS = 'http://www.w3.org/2000/svg';

// Ventanas iluminadas del skyline del hero (deterministas).
export function renderSkyline() {
  const g = document.querySelector('.sky-windows');
  if (!g) return;
  const rand = rng(7);
  document.querySelectorAll('.sky-t rect').forEach((t) => {
    const x = +t.getAttribute('x'), y = +t.getAttribute('y');
    const w = +t.getAttribute('width'), h = +t.getAttribute('height');
    for (let yy = y + 18; yy < y + h - 30; yy += 26) {
      for (let c = 0; c < 5; c++) {
        if (rand() > 0.42) continue;
        const r = document.createElementNS(SVGNS, 'rect');
        r.setAttribute('x', x + 14 + c * ((w - 28) / 5));
        r.setAttribute('y', yy);
        r.setAttribute('width', (w - 28) / 5 - 8);
        r.setAttribute('height', 12);
        r.setAttribute('opacity', (0.55 + rand() * 0.45).toFixed(2));
        g.appendChild(r);
      }
    }
  });
}

function miniPlan(t) {
  const w = t.id === 'C' ? 280 : t.id === 'A' ? 240 : 200;
  const h = 240;
  const b = balconyRect(w);
  return `<svg viewBox="-8 -34 ${w + 16} ${h + 42}" class="plan-mini" aria-hidden="true">
    <rect class="pl-balc" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/>
    <rect class="pl-unit" x="0" y="0" width="${w}" height="${h}"/>
    ${interiorSVG(w, h, t)}
  </svg>`;
}

export function renderTipologias(data) {
  const box = document.getElementById('tipos');
  if (!box) return;
  const desde = (id) => Math.min(...data.unidades.filter((u) => u.tipo === id).map((u) => u.precio));
  box.innerHTML = data.tipologias.map((t) => `
    <article class="card tipo" data-rv>
      <div class="tipo-plan">${miniPlan(t)}</div>
      <h3>${t.nombre}</h3>
      <div class="tipo-facts"><span><b>${m2(t.m2)}</b></span><span><b>${t.rec}</b> rec.</span><span><b>${t.banos}</b> baño${t.banos > 1 ? 's' : ''}</span></div>
      <p>${t.desc}</p>
      <div class="tipo-precio"><small>desde </small>${money(desde(t.id))}</div>
    </article>`).join('');
}

const AMEN_ART = {
  alberca: ['#2d6f8f', '#8cc7d6', '<path d="M40 150 q30 -18 60 0 t60 0 t60 0 t60 0 t60 0" /><path d="M40 180 q30 -18 60 0 t60 0 t60 0 t60 0 t60 0"/><path d="M110 120 v-60 h30 M170 120 v-60 h30"/>'],
  gym: ['#3b3a36', '#c2673a', '<path d="M90 110 h180 M70 85 v50 M90 75 v70 M270 75 v70 M290 85 v50"/>'],
  cowork: ['#5a4a3f', '#e3c08f', '<rect x="110" y="60" width="140" height="90" rx="6"/><path d="M85 165 h190"/>'],
  roof: ['#7a3e2a', '#f0a868', '<circle cx="180" cy="95" r="34"/><path d="M180 40 v-14 M180 164 v-14 M125 95 h-14 M249 95 h-14 M141 56 l-10 -10 M219 56 l10 -10"/><path d="M60 185 h240"/>'],
  pet: ['#476b4a', '#cfe0b4', '<circle cx="180" cy="125" r="28"/><circle cx="140" cy="82" r="13"/><circle cx="170" cy="66" r="13"/><circle cx="200" cy="66" r="13"/><circle cx="228" cy="84" r="13"/>'],
  kids: ['#8a5a8f', '#f2c6d4', '<circle cx="150" cy="80" r="30"/><circle cx="215" cy="95" r="26"/><path d="M150 110 q-6 30 6 60 M215 121 q8 26 -4 50"/>'],
};

export function renderAmenidades(data) {
  const track = document.getElementById('amen-track');
  if (!track) return;
  track.innerHTML = data.amenidades.map((a) => {
    const [bg, fg, art] = AMEN_ART[a.id] || AMEN_ART.alberca;
    return `<article class="card amen-card">
      <div class="amen-art" style="background:${bg}">
        <svg viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${art}</g>
        </svg>
      </div>
      <div class="amen-body"><h3>${a.nombre}</h3><p>${a.desc}</p></div>
    </article>`;
  }).join('');
}
