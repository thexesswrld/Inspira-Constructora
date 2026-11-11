# Showroom virtual demo — "Residencial Mirador"

Fecha: 2026-11-11 · Estado: diseño aprobado en conversación, pendiente de revisión escrita

## Propósito

Demo genérica que Inspira Constructora usará para **ofrecer el servicio de showroom virtual a desarrolladoras inmobiliarias**. Debe permitir que alguien entienda el producto en un minuto: entrar, girar el conjunto en 3D, elegir torre y piso, tocar un departamento y ver su precio y cotización.

Referencia analizada: `terra-alta-demo-ms.pages.dev` (Three.js + 3D Tiles de Google, plano SVG, Pannellum, animaciones con IntersectionObserver/CSS).

## Decisiones

| Tema | Decisión |
|---|---|
| Material | Ninguno. Todo se genera por código (edificios, entorno, planos). |
| Alcance v1 | Landing animada, órbita 3D del conjunto, plano de nivel en SVG. |
| Fuera de alcance v1 | Tour 360°, Google 3D Tiles / Cesium, CMS o panel de administración, backend, envío de formularios a servidor. |
| Stack | Vite (build y dev server), Three.js (3D), GSAP + ScrollTrigger (animación), JavaScript con módulos ES (sin framework), Vitest (pruebas). |
| Despliegue | Sitio estático (`dist/`), apto para Cloudflare Pages o Netlify. |
| Idioma | Español (México), moneda MXN. |

## Desarrollo ficticio

- Nombre: **Residencial Mirador**.
- 3 torres (`T1`, `T2`, `T3`), 12 niveles cada una; nivel 1 = lobby/comercio (sin unidades en venta), niveles 2–12 residenciales.
- 8 unidades por nivel residencial → 88 por torre, 264 en total.
- 3 tipologías: **A** (2 rec, 2 baños, 76 m²), **B** (2 rec, 1 baño, 64 m²), **C** (3 rec, 2 baños, 92 m²). La posición de la unidad en la planta (01–08) fija su tipología.
- Precio = precio base de tipología × (1 + 0.012 × (nivel − 2)), redondeado a miles.
- Estados: `disponible`, `apartada`, `vendida`, repartidos con un generador pseudoaleatorio con semilla fija (≈60 / 15 / 25 %), así los datos son estables entre recargas.
- IDs de unidad: `T1-0502` = torre 1, nivel 5, unidad 02.

## Arquitectura

```
index.html                 landing + contenedor #showroom
src/
  main.js                  arranque: carga datos, inicia landing y router
  router.js                rutas por hash
  data/generate.js         genera los datos de forma determinista (función pura)
scripts/gen-data.js        `npm run gen`: escribe public/data.json
public/data.json           desarrollo, torres, tipologías, unidades, cotizador, contacto
src/
  showroom.js              capa del showroom; carga la órbita bajo demanda
  plano/layout.js          geometría de la planta tipo (compartida con la landing)
  plano/index.js           vista de nivel (plano + riel + ficha)
  orbita/index.js          vista de órbita
  lib/units.js             consultas puras sobre unidades
  lib/finance.js           cálculo de enganche y mensualidad (puro)
  lib/format.js            moneda MXN, m²
  landing/motion.js        animaciones GSAP + ScrollTrigger
  landing/cotizador.js     cotizador de la landing
  orbita/scene.js          renderer, cámara, luces, OrbitControls, ciclo de render
  orbita/torres.js         geometría de torres por código
  orbita/entorno.js        terreno, alberca, caminos, árboles low-poly, cielo
  orbita/etiquetas.js      etiquetas HTML proyectadas sobre las torres
  orbita/picking.js        raycast: hover/clic en torre y nivel
  plano/plano.js           SVG de la planta tipo generado desde datos
  ui/ficha.js              ficha de unidad + cotizador
  ui/selector-nivel.js     riel de niveles
  ui/disponibilidad.js     panel de conteos por estado
styles/tokens.css          colores, tipografía, espacios (re-tematizable por cliente)
styles/*.css               componentes
tests/                     Vitest
```

Límites entre unidades:

- `lib/*` son funciones puras sin DOM; todo lo demás las consume.
- `orbita/*` sólo conoce Three.js y emite eventos (`torre:hover`, `nivel:select`); no navega por sí mismo.
- `router.js` es el único que cambia de vista; las vistas exponen `mount(root, ctx)` y devuelven `unmount()`.
- `data.json` es la única fuente de datos; adaptar la demo a otro cliente = cambiar `data.json` + `tokens.css`.

### Rutas

| Hash | Vista |
|---|---|
| `#/` o vacío | Landing (showroom cerrado) |
| `#/orbita` | Órbita 3D del conjunto |
| `#/torre/T1/5` | Plano del nivel 5 de la torre 1 |
| `#/unidad/T1-0502` | Plano del nivel con la ficha de la unidad abierta |

Rutas inválidas (torre o nivel inexistente, nivel 1) redirigen a `#/orbita`.

## Landing (GSAP)

Secciones en orden: hero a pantalla completa (título revelado por palabras, botón "Explorar en 3D"), el desarrollo (texto + cifras con contador animado: torres, residencias, m² de amenidades, entrega), tipologías (A/B/C con planta simplificada en SVG), amenidades (carrusel horizontal fijado con ScrollTrigger en escritorio; lista vertical en móvil), cotizador, contacto (botón a WhatsApp con mensaje prellenado; número de ejemplo).

Animaciones: entradas con `gsap.from` disparadas por ScrollTrigger (opacidad + desplazamiento, escalonado), parallax suave en imágenes de fondo (gradientes/ilustración generada, sin fotos). Con `prefers-reduced-motion: reduce` no se registran animaciones y todo se muestra en su estado final.

## Órbita 3D

- Torres: volumen por nivel (losa + fachada), ventanas como franjas, balcones en caras frontales, azotea con cuarto de máquinas. Material claro estilo maqueta.
- Entorno: terreno plano con borde, áreas verdes, alberca, caminos, ~60 árboles low-poly instanciados (`InstancedMesh`), cielo con gradiente, una luz direccional con sombras suaves + luz hemisférica.
- Controles: `OrbitControls` con amortiguación, ángulo polar limitado (no bajo el suelo), distancia mín./máx., sin desplazamiento lateral. Autorrotación lenta hasta la primera interacción.
- Interacción: hover sobre una torre resalta el nivel bajo el cursor y muestra "Torre 1 · Nivel 5 · 3 disponibles"; clic → transición GSAP de cámara hacia la torre → navega a `#/torre/T1/5`. En táctil: primer toque resalta, segundo toque entra.
- Etiquetas HTML sobre cada torre: nombre, niveles, disponibles.
- Panel de disponibilidad: conteos totales por estado.
- Rendimiento: `devicePixelRatio` máximo 2 (1.5 en móvil), render sólo cuando algo cambia o hay animación.
- Sin WebGL: se muestra una lista de torres con conteos y enlaces a sus niveles.

## Plano de nivel (SVG)

- Planta tipo única en `viewBox` fijo: núcleo central (elevadores, escaleras, pasillo) y 8 unidades alrededor, con muros, vanos de puerta y mobiliario esquemático por tipología.
- Cada unidad es un `<path>` con relleno según estado (verde / ámbar / gris) y número visible. Las vendidas no son seleccionables.
- Hover: resalte + tooltip (ID, tipología, precio). Clic: abre la ficha y cambia el hash a `#/unidad/...`.
- Ficha: ID, tipología, m², recámaras, baños, precio, estado; cotizador (enganche 10–50 %, plazo 5–20 años, tasa fija de ejemplo 10.5 %) y botón de WhatsApp con mensaje prellenado.
- Riel de niveles 2–12 a la derecha con indicador de disponibles por nivel; botón "Volver al conjunto".
- Transición entre niveles con GSAP (fundido + leve desplazamiento).

## Errores

- `data.json` no carga: el botón "Explorar en 3D" se oculta y la landing sigue funcionando; se registra en consola.
- WebGL no disponible o falla al crear el contexto: respaldo de lista (ver arriba).
- Ruta inválida: redirección a `#/orbita`.

## Pruebas

- Vitest: `lib/units.js` (conteos, filtros, validación de IDs), `lib/finance.js` (enganche, mensualidad, tasa 0), `router.js` (parseo de rutas válidas e inválidas), `data/generate.js` (determinismo: misma semilla → mismo resultado; 264 unidades).
- Verificación manual en navegador: escritorio y móvil (375 px); recorrido completo landing → órbita → nivel → unidad → WhatsApp; `prefers-reduced-motion`.

## Criterio de terminado

`npm run build` genera `dist/` estático; `npm test` pasa; el recorrido completo funciona en escritorio y móvil sin errores en consola.
