const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('es-MX');

export const money = (n) => mxn.format(n);
export const number = (n) => num.format(n);
export const m2 = (n) => `${num.format(n)} m²`;

export function waLink(phone, text) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
