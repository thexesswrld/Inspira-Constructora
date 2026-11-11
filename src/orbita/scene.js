// Renderer, cámara, luces y controles. Renderiza sólo cuando algo cambia.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export const HOME = { position: new THREE.Vector3(120, 78, 150), target: new THREE.Vector3(0, 14, -12) };

// En pantallas verticales la cámara se aleja para que quepa el conjunto completo.
export function homePosition(aspect) {
  const k = Math.min(1.7, Math.max(1, 0.8 / aspect));
  return HOME.position.clone().sub(HOME.target).multiplyScalar(k).add(HOME.target);
}

export function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const mobile = matchMedia('(max-width: 720px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xeadccb, 260, 620);

  const camera = new THREE.PerspectiveCamera(36, 1, 1, 2000);
  camera.position.copy(HOME.position);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 55;
  controls.maxDistance = 520;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = 1.36;
  controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = 0.45;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x8c7c64, 1.5));
  const sun = new THREE.DirectionalLight(0xffe0bd, 2.8);
  sun.position.set(-100, 150, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -140, right: 140, top: 140, bottom: -140, near: 10, far: 450 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.5;
  scene.add(sun);

  let active = true;
  let dirty = true;
  let raf = 0;
  const afterRender = new Set();

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  camera.position.copy(homePosition(camera.aspect));

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!active) return;
    const moved = controls.update();
    if (moved || dirty) {
      renderer.render(scene, camera);
      afterRender.forEach((f) => f());
      dirty = false;
    }
  };
  loop();

  return {
    THREE, renderer, scene, camera, controls,
    requestRender: () => { dirty = true; },
    onAfterRender: (f) => afterRender.add(f),
    setActive: (v) => { active = v; if (v) { dirty = true; resize(); } },
    dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); },
  };
}
