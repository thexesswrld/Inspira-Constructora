import { unitsOnLevel, countByStatus, residentialLevels } from '../lib/units.js';

// Riel de niveles (de arriba hacia abajo) con disponibles por nivel.
export function railHTML(data, torre, actual) {
  const levels = residentialLevels(torre).reverse();
  return levels.map((n) => {
    const c = countByStatus(unitsOnLevel(data.unidades, torre.id, n));
    return `<a href="#/torre/${torre.id}/${n}" class="rail-n${n === actual ? ' is-on' : ''}"${n === actual ? ' aria-current="true"' : ''}
      aria-label="Nivel ${n}, ${c.disponible} disponibles"><span>${n}</span><i style="--d:${c.disponible / 8}"></i></a>`;
  }).join('');
}
