import { ESTADOS, ESTADO_LABEL } from '../lib/units.js';

// Leyenda con conteos por estado.
export const legendHTML = (counts) => `<ul class="legend">${ESTADOS.map((e) =>
  `<li><i class="dot dot-${e}"></i>${ESTADO_LABEL[e]}<b>${counts[e]}</b></li>`).join('')}</ul>`;
