import { describe, it, expect } from 'vitest';
import { generate } from '../src/data/generate.js';
import {
  unitId, parseUnitId, unitsOfTower, unitsOnLevel, countByStatus,
  findUnit, isSelectable, residentialLevels, isValidLevel,
} from '../src/lib/units.js';
import { quote } from '../src/lib/finance.js';
import { money } from '../src/lib/format.js';
import { parseRoute } from '../src/router.js';

const data = generate();

describe('generate', () => {
  it('es determinista', () => {
    expect(generate()).toEqual(generate());
  });
  it('crea 264 unidades en 3 torres', () => {
    expect(data.torres).toHaveLength(3);
    expect(data.unidades).toHaveLength(264);
  });
  it('el nivel 1 no tiene unidades', () => {
    expect(data.unidades.some((u) => u.nivel === 1)).toBe(false);
  });
  it('el precio sube con el nivel', () => {
    const a = findUnit(data.unidades, 'T1-0201');
    const b = findUnit(data.unidades, 'T1-1201');
    expect(b.precio).toBeGreaterThan(a.precio);
    expect(a.precio % 1000).toBe(0);
  });
  it('reparte los tres estados', () => {
    const c = countByStatus(data.unidades);
    expect(c.disponible).toBeGreaterThan(c.vendida);
    expect(c.vendida).toBeGreaterThan(0);
    expect(c.apartada).toBeGreaterThan(0);
  });
});

describe('units', () => {
  it('arma y lee ids', () => {
    expect(unitId('T2', 5, 3)).toBe('T2-0503');
    expect(parseUnitId('T2-0503')).toEqual({ torre: 'T2', nivel: 5, pos: 3 });
    expect(parseUnitId('T2-5')).toBeNull();
    expect(parseUnitId('')).toBeNull();
  });
  it('filtra por torre y nivel', () => {
    expect(unitsOfTower(data.unidades, 'T1')).toHaveLength(88);
    expect(unitsOnLevel(data.unidades, 'T3', 7)).toHaveLength(8);
  });
  it('niveles residenciales', () => {
    const t = data.torres[0];
    expect(residentialLevels(t)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(isValidLevel(data, 'T1', 12)).toBe(true);
    expect(isValidLevel(data, 'T1', 1)).toBe(false);
    expect(isValidLevel(data, 'T9', 5)).toBe(false);
  });
  it('vendidas no se seleccionan', () => {
    expect(isSelectable({ estado: 'vendida' })).toBe(false);
    expect(isSelectable({ estado: 'apartada' })).toBe(true);
  });
});

describe('finance', () => {
  it('calcula enganche y mensualidad', () => {
    const q = quote({ precio: 1_000_000, enganchePct: 20, anios: 20, tasaAnual: 10.5 });
    expect(q.enganche).toBe(200_000);
    expect(q.financiado).toBe(800_000);
    expect(q.mensualidad).toBe(7987);
  });
  it('tasa cero divide en partes iguales', () => {
    const q = quote({ precio: 1_200_000, enganchePct: 0, anios: 10, tasaAnual: 0 });
    expect(q.mensualidad).toBe(10_000);
  });
  it('formatea moneda', () => {
    expect(money(3450000)).toMatch(/3,450,000/);
  });
});

describe('router', () => {
  it('landing por defecto', () => {
    expect(parseRoute('', data)).toEqual({ view: 'landing' });
    expect(parseRoute('#/', data)).toEqual({ view: 'landing' });
    expect(parseRoute('#inicio', data)).toEqual({ view: 'landing' });
  });
  it('orbita', () => {
    expect(parseRoute('#/orbita', data)).toEqual({ view: 'orbita' });
  });
  it('nivel', () => {
    expect(parseRoute('#/torre/T2/5', data)).toEqual({ view: 'nivel', torre: 'T2', nivel: 5, unidad: null });
  });
  it('unidad', () => {
    expect(parseRoute('#/unidad/T1-0502', data)).toEqual({ view: 'nivel', torre: 'T1', nivel: 5, unidad: 'T1-0502' });
  });
  it('rutas inválidas redirigen a la órbita', () => {
    expect(parseRoute('#/torre/T1/1', data)).toEqual({ view: 'orbita', invalid: true });
    expect(parseRoute('#/torre/T7/5', data)).toEqual({ view: 'orbita', invalid: true });
    expect(parseRoute('#/unidad/T1-0599', data)).toEqual({ view: 'orbita', invalid: true });
    expect(parseRoute('#/cualquier', data)).toEqual({ view: 'orbita', invalid: true });
  });
});
