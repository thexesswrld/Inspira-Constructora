// Cotizador de la landing y botones de contacto.
import { quote } from '../lib/finance.js';
import { money, waLink } from '../lib/format.js';

const $ = (id) => document.getElementById(id);

export function initQuoter(data) {
  const { cotizador: cfg, desarrollo, contacto } = data;
  const desde = (id) => Math.min(...data.unidades.filter((u) => u.tipo === id).map((u) => u.precio));

  const contactWa = $('contact-wa');
  if (contactWa) contactWa.href = waLink(contacto.whatsapp, `Hola, vi la demo de ${desarrollo.nombre} y quiero un showroom virtual para mi desarrollo.`);

  const tipo = $('q-tipo'), eng = $('q-eng'), plazo = $('q-plazo');
  if (!tipo) return;
  tipo.innerHTML = data.tipologias.map((t) => `<option value="${t.id}">${t.nombre} · ${t.m2} m² · desde ${money(desde(t.id))}</option>`).join('');
  Object.assign(eng, { min: cfg.engancheMin, max: cfg.engancheMax, step: 5, value: cfg.engancheDefault });
  Object.assign(plazo, { min: cfg.plazoMin, max: cfg.plazoMax, step: 1, value: cfg.plazoDefault });

  const update = () => {
    const t = data.tipologias.find((x) => x.id === tipo.value);
    const precio = desde(t.id);
    const q = quote({ precio, enganchePct: +eng.value, anios: +plazo.value, tasaAnual: cfg.tasa });
    $('q-eng-o').textContent = `${eng.value} %`;
    $('q-plazo-o').textContent = `${plazo.value} años`;
    $('q-precio').textContent = money(precio);
    $('q-eng-v').textContent = money(q.enganche);
    $('q-mens').textContent = money(q.mensualidad);
    $('q-wa').href = waLink(contacto.whatsapp,
      `Hola, me interesa el ${t.nombre} de ${desarrollo.nombre}. Con ${eng.value} % de enganche a ${plazo.value} años, la mensualidad estimada es ${money(q.mensualidad)}. ¿Me comparten información?`);
  };
  [tipo, eng, plazo].forEach((el) => el.addEventListener('input', update));
  update();
}
