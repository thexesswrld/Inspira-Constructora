import { isValidLevel, parseUnitId, findUnit } from './lib/units.js';

const INVALID = { view: 'orbita', invalid: true };

// Traduce el hash a una vista. Sólo los hash que empiezan con "#/" son del showroom;
// los demás (#inicio, #amenidades…) son anclas de la landing.
export function parseRoute(hash, data) {
  if (!hash || hash === '#' || hash === '#/' || !hash.startsWith('#/')) return { view: 'landing' };
  const parts = hash.slice(2).split('/').filter(Boolean);
  const [head, a, b] = parts;

  if (head === 'orbita' && parts.length === 1) return { view: 'orbita' };

  if (head === 'torre' && parts.length === 3) {
    const nivel = Number(b);
    return isValidLevel(data, a, nivel) ? { view: 'nivel', torre: a, nivel, unidad: null } : INVALID;
  }

  if (head === 'unidad' && parts.length === 2) {
    const p = parseUnitId(a);
    if (!p || !findUnit(data.unidades, a)) return INVALID;
    return { view: 'nivel', torre: p.torre, nivel: p.nivel, unidad: a };
  }

  return INVALID;
}

export const go = (hash) => {
  if (location.hash !== hash) location.hash = hash;
};

export function startRouter(data, onChange) {
  const handle = () => {
    const route = parseRoute(location.hash, data);
    if (route.invalid) {
      history.replaceState(null, '', '#/orbita');
      onChange({ view: 'orbita' });
      return;
    }
    onChange(route);
  };
  addEventListener('hashchange', handle);
  handle();
  return () => removeEventListener('hashchange', handle);
}
