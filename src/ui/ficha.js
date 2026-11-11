// Ficha de unidad con cotizador integrado.
import { quote } from '../lib/finance.js';
import { money, m2, waLink } from '../lib/format.js';
import { ESTADO_LABEL } from '../lib/units.js';

export function renderFicha(el, unit, data) {
  const t = data.tipologias.find((x) => x.id === unit.tipo);
  const torre = data.torres.find((x) => x.id === unit.torre);
  const cfg = data.cotizador;
  const vendible = unit.estado !== 'vendida';
  el.innerHTML = `
    <button class="fc-close" type="button" aria-label="Cerrar ficha">×</button>
    <span class="badge badge-${unit.estado}">${ESTADO_LABEL[unit.estado]}</span>
    <h3 class="fc-title">Unidad ${unit.id}</h3>
    <p class="fc-sub">${t.nombre} · ${torre.nombre} · Nivel ${unit.nivel}</p>
    <dl class="fc-facts">
      <div><dt>Superficie</dt><dd>${m2(unit.m2)}</dd></div>
      <div><dt>Recámaras</dt><dd>${unit.rec}</dd></div>
      <div><dt>Baños</dt><dd>${unit.banos}</dd></div>
      <div><dt>Precio</dt><dd>${money(unit.precio)}</dd></div>
    </dl>
    <p class="fc-desc">${t.desc}</p>
    ${vendible ? `
    <div class="fc-quoter">
      <label>Enganche <output data-o="eng"></output>
        <input type="range" data-i="eng" min="${cfg.engancheMin}" max="${cfg.engancheMax}" step="5" value="${cfg.engancheDefault}"></label>
      <label>Plazo <output data-o="plazo"></output>
        <input type="range" data-i="plazo" min="${cfg.plazoMin}" max="${cfg.plazoMax}" step="1" value="${cfg.plazoDefault}"></label>
      <div class="fc-out"><span>Mensualidad estimada</span><strong data-o="mens"></strong><small data-o="engv"></small></div>
    </div>
    <a class="btn btn-wa" data-o="wa" target="_blank" rel="noopener">${unit.estado === 'apartada' ? 'Preguntar si se libera' : 'Quiero esta unidad'}</a>`
    : '<p class="fc-sold">Esta unidad ya se vendió. Revisa otras en este nivel.</p>'}
  `;
  if (!vendible) return;
  const $ = (k) => el.querySelector(`[data-o="${k}"]`);
  const eng = el.querySelector('[data-i="eng"]');
  const plazo = el.querySelector('[data-i="plazo"]');
  const update = () => {
    const q = quote({ precio: unit.precio, enganchePct: +eng.value, anios: +plazo.value, tasaAnual: cfg.tasa });
    $('eng').textContent = `${eng.value} %`;
    $('plazo').textContent = `${plazo.value} años`;
    $('mens').textContent = money(q.mensualidad);
    $('engv').textContent = `Enganche ${money(q.enganche)} · tasa de ejemplo ${cfg.tasa} %`;
    $('wa').href = waLink(data.contacto.whatsapp,
      `Hola, me interesa la unidad ${unit.id} (${t.nombre}, ${torre.nombre}, nivel ${unit.nivel}) de ${data.desarrollo.nombre}, precio ${money(unit.precio)}. Con ${eng.value} % de enganche a ${plazo.value} años la mensualidad estimada es ${money(q.mensualidad)}.`);
  };
  eng.addEventListener('input', update);
  plazo.addEventListener('input', update);
  update();
}
