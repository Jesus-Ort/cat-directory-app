# 🐱 Michiario

Directorio de razas de gatos desarrollado como parte de una prueba técnica para Frontend Developer.

**Demo:** https://cat-directory-app-three.vercel.app

## Stack

* Nuxt 4 + Vue 3
* TypeScript
* Nuxt UI
* Pinia
* Zod
* Tailwind CSS
* pnpm
* Vercel

## Características

* SSR para la carga inicial.
* Infinite scroll.
* Virtualización mediante `UScrollArea`.
* Búsqueda local con debounce.
* Persistencia de búsqueda y página mediante query params.
* Página de detalle por raza.
* Random cat fact.
* Retry automático con exponential backoff.
* Validación de respuestas con Zod.
* Estados de loading y error.
* Refresh de la lista.
* Accesibilidad y SEO.
* Responsive design.

## Arquitectura

```text
UI
 ↓
Pinia
 ↓
Services
 ↓
Cat Fact Ninja API
```

La lógica de acceso a datos está separada de la UI mediante servicios, mientras que Pinia centraliza el estado del directorio.

### Estructura principal

```text
app/
├── pages/
├── services/
├── stores/
├── types/
└── utils/
```

## ¿Por qué Nuxt?

La prueba recomienda Next.js, pero permite utilizar Vue/Nuxt.

Se eligió Nuxt por su integración con Vue 3, SSR, routing basado en archivos, TypeScript y facilidad para integrar Pinia y Nuxt UI.

## API

Se utiliza [Cat Fact Ninja](https://catfact.ninja/):

```text
GET /breeds?page={page}
GET /fact
```

## Instalación

Requiere **Node.js** y **pnpm**.

```bash
pnpm install
pnpm dev
```

Para producción:

```bash
pnpm build
pnpm preview
```

## Lighthouse

Resultados actuales:

| Categoría      | Resultado |
| -------------- | --------: |
| Performance    |      > 90 |
| Accessibility  |       100 |
| Best Practices |       100 |
| SEO            |      > 90 |

## Estado

* [x] SSR
* [x] Infinite scroll
* [x] Virtualización
* [x] Búsqueda
* [x] Query params
* [x] Detalle de raza
* [x] Random fact
* [x] Pinia
* [x] Zod
* [x] Retry
* [x] Accesibilidad
* [x] SEO
