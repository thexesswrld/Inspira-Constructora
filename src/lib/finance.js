// Cotizador: enganche y mensualidad de un crédito a tasa fija (amortización francesa).
export function quote({ precio, enganchePct, anios, tasaAnual }) {
  const enganche = Math.round((precio * enganchePct) / 100);
  const financiado = precio - enganche;
  const n = anios * 12;
  const r = tasaAnual / 100 / 12;
  const mensualidad = r === 0 ? financiado / n : (financiado * r) / (1 - Math.pow(1 + r, -n));
  return { enganche, financiado, mensualidad: Math.round(mensualidad) };
}
