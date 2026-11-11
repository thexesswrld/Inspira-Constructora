// Animaciones de la landing con GSAP + ScrollTrigger.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { number } from '../lib/format.js';

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Envuelve cada palabra en .w > .wi para revelarla desde abajo.
export function splitWords(el) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`).join(' ');
}

export function initMotion() {
  document.querySelectorAll('[data-split]').forEach(splitWords);

  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    trigger: '.hero', start: 'bottom top+=80',
    onEnter: () => nav.classList.add('solid'),
    onLeaveBack: () => nav.classList.remove('solid'),
  });

  if (reduceMotion()) return;

  // Entrada del hero
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero-sky', { opacity: 0, duration: 1.6 }, 0)
    .from('.sky-t', { yPercent: 100, duration: 1.8, stagger: 0.14, ease: 'power4.out' }, 0.1)
    .from('.sky-windows rect', { opacity: 0, duration: 0.5, stagger: { each: 0.003, from: 'random' } }, 1)
    .from('.hero-title .wi', { yPercent: 115, duration: 1.3, stagger: 0.09 }, 0.55)
    .from('.hero-in', { y: 26, opacity: 0, duration: 1.1, stagger: 0.12 }, 0.95)
    .from('.nav', { y: -24, opacity: 0, duration: 0.9 }, 1.2)
    .from('.scroll-hint', { opacity: 0, duration: 0.8 }, 1.6);

  gsap.to('.hero-skyline', {
    yPercent: 14, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-inner', {
    yPercent: -18, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Títulos de sección: palabras que suben
  document.querySelectorAll('[data-split]:not(.hero-title)').forEach((el) => {
    gsap.from(el.querySelectorAll('.wi'), {
      yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });

  // Bloques: aparecen escalonados por lote
  gsap.set('[data-rv]', { opacity: 0, y: 32 });
  ScrollTrigger.batch('[data-rv]', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, overwrite: true }),
  });

  // Contadores
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = number(Math.round(o.v)); },
    });
  });

  // Fondo del bloque 3D en parallax
  gsap.fromTo('.cta-3d-bg', { yPercent: -10 }, {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.cta-3d', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Amenidades: carrusel horizontal fijado (sólo escritorio)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = document.getElementById('amen-track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.amen', start: 'top top', end: () => `+=${dist()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true,
      },
    });
  });
}

export const refreshScroll = () => ScrollTrigger.refresh();
