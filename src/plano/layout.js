// Geometría de la planta tipo (viewBox 0 0 1100 700). Fila norte: 1–4 (izq→der),
// fila sur: 5–8 (der→izq). Las tipologías siguen TIPO_POR_POSICION del generador.

export const VIEWBOX = '0 0 1100 700';
export const PLACA = { x: 50, y: 50, w: 1000, h: 600 };
export const PASILLO = { x: 50, y: 290, w: 1000, h: 120 };
export const NUCLEO = { x: 480, y: 315, w: 140, h: 70 };

// facing 'n': la fachada exterior está arriba; 's': abajo.
export const UNIDADES = {
  1: { x: 50, y: 50, w: 280, h: 240, facing: 'n' },
  2: { x: 330, y: 50, w: 240, h: 240, facing: 'n' },
  3: { x: 570, y: 50, w: 200, h: 240, facing: 'n' },
  4: { x: 770, y: 50, w: 280, h: 240, facing: 'n' },
  5: { x: 770, y: 410, w: 280, h: 240, facing: 's' },
  6: { x: 570, y: 410, w: 200, h: 240, facing: 's' },
  7: { x: 330, y: 410, w: 240, h: 240, facing: 's' },
  8: { x: 50, y: 410, w: 280, h: 240, facing: 's' },
};

// Transformación que lleva el espacio local de la unidad (exterior en y=0) a la planta.
export function unitTransform(g) {
  return g.facing === 'n'
    ? `translate(${g.x} ${g.y})`
    : `translate(${g.x} ${g.y + g.h}) scale(1 -1)`;
}

// Interior esquemático en espacio local: muros, puertas y mobiliario.
// Devuelve un string SVG; quien lo use decide colores vía CSS (.pl-wall, .pl-furn).
export function interiorSVG(w, h, tipo) {
  const px = Math.round(w * 0.55);
  const parts = [];
  const wall = (x1, y1, x2, y2) => parts.push(`<line class="pl-wall" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
  const furn = (s) => parts.push(s.replace(/^<(\w+)/, '<$1 class="pl-furn"'));

  // Muro entre zona social y recámaras
  wall(px, 0, px, h - 34);
  // Recámaras apiladas en la zona derecha
  const rh = h / tipo.rec;
  for (let i = 1; i < tipo.rec; i++) wall(px, Math.round(i * rh), w, Math.round(i * rh));
  for (let i = 0; i < tipo.rec; i++) {
    const cy = i * rh + rh / 2;
    const bw = Math.min(64, (w - px) * 0.55);
    const bh = Math.min(48, rh * 0.55);
    const bx = w - bw - 10;
    furn(`<rect x="${bx}" y="${cy - bh / 2}" width="${bw}" height="${bh}" rx="4"/>`);
    furn(`<rect x="${bx + bw - 14}" y="${cy - bh / 2 + 5}" width="9" height="${bh - 10}" rx="2"/>`);
  }
  // Baño junto al pasillo
  wall(px - 74, h - 78, px, h - 78);
  wall(px - 74, h - 78, px - 74, h);
  furn(`<rect x="${px - 64}" y="${h - 66}" width="24" height="30" rx="8"/>`);
  if (tipo.banos > 1) {
    const bx = px + 6;
    wall(px, rh - 60, px + 60, rh - 60);
    wall(px + 60, rh - 60, px + 60, rh);
    furn(`<rect x="${bx + 14}" y="${rh - 50}" width="22" height="26" rx="8"/>`);
  }
  // Cocina en L
  furn(`<path d="M8 ${h - 90} h22 v58 h60 v22 h-82 z"/>`);
  // Sala y comedor
  const sw = Math.min(110, px - 50);
  furn(`<rect x="18" y="26" width="${sw}" height="32" rx="10"/>`);
  furn(`<circle cx="${18 + sw / 2}" cy="${h / 2 + 6}" r="22"/>`);
  // Puerta de acceso (abatimiento) en el lado del pasillo
  const dx = px - 112;
  parts.push(`<path class="pl-door" d="M${dx} ${h} A34 34 0 0 1 ${dx + 34} ${h - 34} L${dx + 34} ${h}"/>`);
  return parts.join('');
}

// Balcón: franja fuera de la placa, del lado exterior, en la zona social.
export const balconyRect = (w) => ({ x: 12, y: -26, w: Math.round(w * 0.55) - 24, h: 26 });
