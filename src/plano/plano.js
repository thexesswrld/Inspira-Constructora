// SVG de la planta tipo de un nivel, coloreado por estado de cada unidad.
import { VIEWBOX, PLACA, PASILLO, NUCLEO, UNIDADES, unitTransform, interiorSVG, balconyRect } from './layout.js';
import { ESTADO_LABEL } from '../lib/units.js';
import { money } from '../lib/format.js';

function core() {
  const { x, y, w, h } = NUCLEO;
  const ew = 34;
  const elevators = [0, 1].map((i) => {
    const ex = x + 8 + i * (ew + 6);
    return `<rect class="pl-core-el" x="${ex}" y="${y + 8}" width="${ew}" height="${h - 16}"/>
      <path class="pl-core-x" d="M${ex} ${y + 8} L${ex + ew} ${y + h - 8} M${ex + ew} ${y + 8} L${ex} ${y + h - 8}"/>`;
  }).join('');
  const sx = x + 92;
  const steps = Array.from({ length: 7 }, (_, i) => `<line class="pl-core-x" x1="${sx}" y1="${y + 10 + i * 8}" x2="${x + w - 8}" y2="${y + 10 + i * 8}"/>`).join('');
  return `<rect class="pl-core" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>${elevators}${steps}`;
}

// vertical: gira la planta 90° para pantallas verticales (las etiquetas se mantienen derechas).
export function planoSVG(units, tipologias, selectedId, { vertical = false } = {}) {
  const tipos = Object.fromEntries(tipologias.map((t) => [t.id, t]));
  const byPos = Object.fromEntries(units.map((u) => [u.pos, u]));
  const unitsSvg = Object.entries(UNIDADES).map(([pos, g]) => {
    const u = byPos[pos];
    if (!u) return '';
    const t = tipos[u.tipo];
    const b = balconyRect(g.w);
    const cx = g.x + g.w / 2;
    const cy = g.facing === 'n' ? g.y + g.h - 40 : g.y + 40;
    const label = `Unidad ${u.id}, ${t.nombre}, ${u.m2} m², ${ESTADO_LABEL[u.estado]}, ${money(u.precio)}`;
    return `<g class="pl-u${u.id === selectedId ? ' is-sel' : ''}" data-id="${u.id}" data-estado="${u.estado}"
        role="button" tabindex="${u.estado === 'vendida' ? -1 : 0}" aria-label="${label}">
      <g transform="${unitTransform(g)}">
        <rect class="pl-balc" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/>
        <rect class="pl-fill" x="0" y="0" width="${g.w}" height="${g.h}"/>
        ${interiorSVG(g.w, g.h, t)}
        <rect class="pl-edge" x="0" y="0" width="${g.w}" height="${g.h}"/>
      </g>
      <g class="pl-tag" transform="translate(${cx} ${cy})${vertical ? ' rotate(-90)' : ''}">
        <rect x="-34" y="-17" width="68" height="34" rx="17"/>
        <text text-anchor="middle" dy="5">${String(u.pos).padStart(2, '0')} · ${u.tipo}</text>
      </g>
    </g>`;
  }).join('');

  const [, , vw, vh] = VIEWBOX.split(' ').map(Number);
  const viewBox = vertical ? `0 0 ${vh} ${vw}` : VIEWBOX;
  return `<svg class="plano" viewBox="${viewBox}" role="group" aria-label="Planta del nivel">
    <g${vertical ? ` transform="translate(${vh} 0) rotate(90)"` : ''}>
    <defs>
      <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="10" height="10" class="pl-hatch-bg"/><line x1="0" y1="0" x2="0" y2="10" class="pl-hatch"/>
      </pattern>
    </defs>
    <rect class="pl-plate" x="${PLACA.x}" y="${PLACA.y}" width="${PLACA.w}" height="${PLACA.h}"/>
    <rect class="pl-corr" x="${PASILLO.x}" y="${PASILLO.y}" width="${PASILLO.w}" height="${PASILLO.h}"/>
    ${core()}
    ${unitsSvg}
    ${vertical ? '' : '<text class="pl-north" x="1062" y="80">N ↑</text>'}
    </g>
  </svg>`;
}
