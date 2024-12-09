---
title: 1. Nested Router
category: Guide
---

## Introduction

Let’s take the following routes:
```ts
type Route =
  | { name: 'Home' }
  | { name: 'Product', productId: number }
  | { name: 'NotFound' }
```

## Base path with no path parameters

We provide the ability to register a base path via the `RouterBuilder`:

```ts
const router = RouterBuilder<Route>()
  .withBasePath('/app')
  .set('home', '/', () => ({ name: 'Home' }))
  .set('product', '/product/:id', () => …)
  .or(() => …)

router.makeLinkTo('home')
// -> /app/
router.makeLinkTo('product', { id: '2' })
// -> /app/product/2
```

## Base path with path parameters

```ts
const router = RouterBuilder<Route>()
  .withBasePath('/lang/:locale')
  .set('home', '/', ({ params /* { locale: string } */ }) => { … })
  .set(
    'product',
    '/product/:id',
    ({ params /* { locale: string, id: string } */ }) => { … }
  )
  .or(…)

router.makeLinkTo('home', { locale: 'fr' })
// -> /lang/fr/
router.makeLinkTo('product', { locale: 'fr', id: '2' })
// -> /lang/fr/product/2
```