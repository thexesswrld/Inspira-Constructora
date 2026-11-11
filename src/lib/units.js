// Consultas puras sobre unidades. Sin DOM.

export const ESTADOS = ['disponible', 'apartada', 'vendida'];
export const ESTADO_LABEL = { disponible: 'Disponible', apartada: 'Apartada', vendida: 'Vendida' };

export const unitId = (torre, nivel, pos) =>
  `${torre}-${String(nivel).padStart(2, '0')}${String(pos).padStart(2, '0')}`;

export function parseUnitId(id) {
  const m = /^(T\d+)-(\d{2})(\d{2})$/.exec(id || '');
  return m ? { torre: m[1], nivel: Number(m[2]), pos: Number(m[3]) } : null;
}

export const unitsOfTower = (units, torre) => units.filter((u) => u.torre === torre);
export const unitsOnLevel = (units, torre, nivel) =>
  units.filter((u) => u.torre === torre && u.nivel === nivel);
export const findUnit = (units, id) => units.find((u) => u.id === id) || null;
export const isSelectable = (u) => !!u && u.estado !== 'vendida';

export function countByStatus(units) {
  const c = { disponible: 0, apartada: 0, vendida: 0 };
  for (const u of units) c[u.estado]++;
  return c;
}

// Nivel 1 es lobby/comercio; los residenciales van del 2 al último.
export const residentialLevels = (torre) =>
  Array.from({ length: torre.niveles - 1 }, (_, i) => i + 2);

export function isValidLevel(data, torreId, nivel) {
  const t = data.torres.find((x) => x.id === torreId);
  return !!t && Number.isInteger(nivel) && nivel >= 2 && nivel <= t.niveles;
}
