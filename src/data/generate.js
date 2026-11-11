// Genera los datos ficticios de "Residencial Mirador" de forma determinista.
// Uso: `npm run gen` (scripts/gen-data.js) escribe public/data.json.
import { unitId } from '../lib/units.js';

export const SEED = 20261111;

// Generador pseudoaleatorio con semilla (mulberry32): mismos datos en cada ejecución.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TIPOLOGIAS = [
  { id: 'A', nombre: 'Tipo A', rec: 2, banos: 2, m2: 76, base: 3_450_000, desc: 'Dos recámaras con baño completo cada una, sala-comedor abierta y balcón.' },
  { id: 'B', nombre: 'Tipo B', rec: 2, banos: 1, m2: 64, base: 2_890_000, desc: 'Distribución eficiente para primera vivienda o inversión, con balcón.' },
  { id: 'C', nombre: 'Tipo C', rec: 3, banos: 2, m2: 92, base: 4_180_000, desc: 'Esquina con doble vista, tres recámaras y terraza amplia.' },
];

// Posición en planta (1–8) → tipología. Las esquinas son tipo C.
export const TIPO_POR_POSICION = { 1: 'C', 2: 'A', 3: 'B', 4: 'C', 5: 'C', 6: 'B', 7: 'A', 8: 'C' };

const TORRES = [
  { id: 'T1', nombre: 'Torre 1', niveles: 12, pos: { x: -46, z: -8, rot: 0.38 } },
  { id: 'T2', nombre: 'Torre 2', niveles: 12, pos: { x: 0, z: -30, rot: 0 } },
  { id: 'T3', nombre: 'Torre 3', niveles: 12, pos: { x: 46, z: -8, rot: -0.38 } },
];

export function generate(seed = SEED) {
  const rand = rng(seed);
  const tipos = Object.fromEntries(TIPOLOGIAS.map((t) => [t.id, t]));
  const unidades = [];
  for (const torre of TORRES) {
    for (let nivel = 2; nivel <= torre.niveles; nivel++) {
      for (let pos = 1; pos <= 8; pos++) {
        const tipo = tipos[TIPO_POR_POSICION[pos]];
        const r = rand();
        const estado = r < 0.6 ? 'disponible' : r < 0.75 ? 'apartada' : 'vendida';
        const precio = Math.round((tipo.base * (1 + 0.012 * (nivel - 2))) / 1000) * 1000;
        unidades.push({
          id: unitId(torre.id, nivel, pos),
          torre: torre.id, nivel, pos, tipo: tipo.id,
          m2: tipo.m2, rec: tipo.rec, banos: tipo.banos, precio, estado,
        });
      }
    }
  }
  return {
    desarrollo: {
      nombre: 'Residencial Mirador',
      lema: 'Vive arriba de todo',
      ubicacion: 'Zona Poniente · Ciudad de ejemplo',
      entrega: 'Diciembre 2028',
      amenidadesM2: 4200,
      demo: true,
    },
    torres: TORRES,
    tipologias: TIPOLOGIAS,
    unidades,
    amenidades: [
      { id: 'alberca', nombre: 'Alberca templada', desc: 'Carril de nado y área de camastros al centro del conjunto.' },
      { id: 'gym', nombre: 'Gimnasio', desc: 'Equipo cardiovascular y de fuerza con vista al jardín.' },
      { id: 'cowork', nombre: 'Cowork', desc: 'Salas de juntas y cabinas para trabajar sin salir de casa.' },
      { id: 'roof', nombre: 'Roof garden', desc: 'Asadores y fogatero en la azotea de cada torre.' },
      { id: 'pet', nombre: 'Pet park', desc: 'Área cercada con juegos y bebedero para mascotas.' },
      { id: 'kids', nombre: 'Ludoteca', desc: 'Espacio interior y exterior para los más pequeños.' },
    ],
    cotizador: { engancheMin: 10, engancheMax: 50, engancheDefault: 20, plazoMin: 5, plazoMax: 20, plazoDefault: 15, tasa: 10.5 },
    contacto: { whatsapp: '5210000000000' },
  };
}
