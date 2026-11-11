# Showroom virtual — demo "Residencial Mirador"

Demo de showroom inmobiliario: landing animada (GSAP), conjunto en 3D (Three.js) y plano de nivel en SVG con ficha y cotizador. Todos los datos son ficticios.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # pruebas (Vitest)
npm run build    # sitio estático en dist/
```

## Adaptarlo a otro cliente

- **Datos** (nombre, torres, niveles, tipologías, precios, estados, WhatsApp): `src/data/generate.js` y luego `npm run gen`, o editar directo `public/data.json`.
- **Colores y tipografía:** `styles/tokens.css`.
- **Planta tipo:** `src/plano/layout.js`.

## Rutas

`#/orbita` conjunto 3D · `#/torre/T1/5` plano de un nivel · `#/unidad/T1-0502` ficha de una unidad.

Diseño: [docs/superpowers/specs/2026-11-11-showroom-virtual-demo-design.md](docs/superpowers/specs/2026-11-11-showroom-virtual-demo-design.md)
