import '../styles/tokens.css';
import '../styles/landing.css';
import '../styles/showroom.css';
import { renderSkyline, renderTipologias, renderAmenidades } from './landing/render.js';
import { initMotion, refreshScroll } from './landing/motion.js';
import { initQuoter } from './landing/cotizador.js';
import { startRouter } from './router.js';
import { createShowroom } from './showroom.js';

async function loadData() {
  const res = await fetch(`${import.meta.env.BASE_URL}data.json`);
  if (!res.ok) throw new Error(`data.json: HTTP ${res.status}`);
  return res.json();
}

function hideShowroomEntry() {
  document.querySelectorAll('[data-open-showroom], #showroom-cta, #tipologias, #cotizador').forEach((el) => { el.hidden = true; });
}

async function boot() {
  renderSkyline();
  let data = null;
  try {
    data = await loadData();
  } catch (err) {
    console.warn('showroom: sin datos, se oculta el showroom', err);
    hideShowroomEntry();
  }
  if (data) {
    renderTipologias(data);
    renderAmenidades(data);
    initQuoter(data);
  }
  initMotion();
  if (!data) return;

  const show = createShowroom(data);
  startRouter(data, show);
  // Al cerrar el showroom, las medidas de ScrollTrigger pueden haber cambiado.
  addEventListener('hashchange', () => { if (!location.hash.startsWith('#/')) requestAnimationFrame(refreshScroll); });
}

boot();
