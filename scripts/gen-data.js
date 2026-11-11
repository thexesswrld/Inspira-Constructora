// Escribe public/data.json a partir del generador determinista.
// Para adaptar la demo a otro cliente: editar src/data/generate.js o el JSON resultante.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generate } from '../src/data/generate.js';

const dir = fileURLToPath(new URL('../public/', import.meta.url));
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}data.json`, JSON.stringify(generate(), null, 2));
console.log(`data.json escrito en ${dir}`);
