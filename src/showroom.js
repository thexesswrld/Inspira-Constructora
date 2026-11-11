// Capa del showroom: abre/cierra el overlay y cambia entre órbita y nivel según la ruta.
// La órbita (Three.js) se carga bajo demanda para no pesar en la landing.
import gsap from 'gsap';
import { mountNivel } from './plano/index.js';
import { go } from './router.js';

export function createShowroom(data) {
  const shell = document.getElementById('showroom');
  const view = document.getElementById('sr-view');
  const crumbs = document.getElementById('sr-crumbs');
  const orbRoot = document.createElement('div');
  const lvRoot = document.createElement('div');
  orbRoot.className = 'sr-pane';
  lvRoot.className = 'sr-pane';
  view.append(orbRoot, lvRoot);

  const ctx = { data, go };
  const nivel = mountNivel(lvRoot, ctx);
  let orbita = null;
  let orbitaLoading = null;
  let returnY = 0;

  const loadOrbita = () => {
    orbitaLoading ||= import('./orbita/index.js').then(({ mountOrbita }) => {
      orbita = mountOrbita(orbRoot, ctx);
      return orbita;
    });
    return orbitaLoading;
  };

  function open() {
    if (!shell.hidden) return;
    returnY = scrollY;
    shell.hidden = false;
    document.body.classList.add('sr-open');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(shell, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'expo.inOut' });
    }
  }
  function close() {
    if (shell.hidden) return;
    orbita?.hide();
    nivel.hide();
    const done = () => {
      shell.hidden = true;
      document.body.classList.remove('sr-open');
      scrollTo(0, returnY);
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else gsap.to(shell, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut', onComplete: done });
  }

  const setCrumbs = (route) => {
    if (route.view === 'orbita') { crumbs.innerHTML = '<span>Conjunto</span>'; return; }
    const t = data.torres.find((x) => x.id === route.torre);
    crumbs.innerHTML = `<a href="#/orbita">Conjunto</a><span>${t.nombre}</span><span>Nivel ${route.nivel}</span>${route.unidad ? `<span>${route.unidad}</span>` : ''}`;
  };

  return async function show(route) {
    if (route.view === 'landing') { close(); return; }
    open();
    setCrumbs(route);
    if (route.view === 'orbita') {
      nivel.hide();
      lvRoot.hidden = true;
      orbRoot.hidden = false;
      (await loadOrbita()).show();
    } else {
      orbita?.hide();
      orbRoot.hidden = true;
      lvRoot.hidden = false;
      nivel.show(route);
      loadOrbita(); // precarga la órbita para el regreso
    }
  };
}
