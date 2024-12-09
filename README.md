<div align="center">

![Package Size](https://deno.bundlejs.com/badge?q=isomorphic-app-router) ![Total coverage](./badges/coverage-total.svg)

Super tiny dependency-free vanilla JS routing library to represent your routing states in pure JS rather than framework-based stuff.<br>
Because it is framework-agnostic, it can be adapted to _every_ framework.

[Documentation](https://sacdenoeuds.github.io/isomorphic-app-router/)

</div>

---

<!-- TOC -->

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Your first route](#your-first-route)
  - [Path Syntax](#path-syntax)
  - [Recipes / Advanced Usage](#recipes--advanced-usage)
- [Why yet-another X ?](#why-yet-another-x-)
- [Contributing](#contributing)

<!-- /TOC -->

## Getting Started

This package is intended to work seamlessly with [history](https://npmjs.com/package/history) and [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) – although `URLPattern` requires a [polyfill](https://npmjs.com/package/urlpattern-polyfill) at the moment.

```sh
npm i -D isomorphic-app-router urlpattern-polyfill
```

### Installation

```ts
// <repo>/library/router.ts
import { RouterBuilderFactory, URLPatternResolver } from 'isomorphic-app-router'
import { createBrowserHistory } from 'history'
import "urlpattern-polyfill"

export const history = createBrowserHistory()

export const RouterBuilder = RouterBuilderFactory({
  history,
  resolver: URLPatternResolver,
})
```

<details>
<summary>The other built-in resolver is <code>path-to-regexp</code>.</summary>

```ts
import { …, PathToRegexpResolver } from 'isomorphic-app-router'
import { match } from 'path-to-regexp'

export const RouterBuilder = RouterBuilderFactory({
  …
  resolver: PathToRegexpResolver(match),
})
```

</details>

### Your first route

```ts
import { RouterBuilder } from '<repo>/library/router'

type Route =
  | { name: 'Home' }
  | { name: 'Product', productId: number }
  | { name: 'NotFound' }

const router = RouterBuilder<Route>()
  // define `Home` route
  .set('home', '/', () => ({ name: 'Home' }))

  // define `Product` route
  .set('product', '/product/:id', ({ params }) => {
    const productId = Number(params.id) // params: { id: string }

    return Number.isNaN(productId)
      ? { name: 'NotFound' }
      : { name: 'Product', productId }
  })

  // finish building the router
  .or(() => ({ name: 'NotFound' })) // required _at the end_

router.makeLinkTo('home') // parameter-less path, no arg required
router.makeLinkTo('product', { id: '2' }) // TS forcefully asks for the route parameters
```

### Path Syntax

I based the library on web standards, namely [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API). Which itself based its syntax on [path-to-regexp](https://github.com/pillarjs/path-to-regexp). Therefore, their syntax prevails.

The [MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) website is an **excellent** place to start. Here are a few tips though:

- `/post/*` will match `/post/`, `/post/1` & `/post/1/2` ; but not `/post` :warning:
  To match `/post` => `post{/*}?`
- `/post{/:id}?` matches `/post` & `/post/1`, not `/post/1/2`
- Regex groups like `/books/(\\d+)` can be used but break intellisense of path parameters
- For nested routers, type the home as `{/}?` 😉

### Recipes / Advanced Usage

- [Nested routing](./guides/nested-router.md)
- [Route comparison](./guides/route-comparison.md)
- [Enforcing a route shape](./guides/enforcing-a-route-shape.md)
- [Router-level history override](./guides/router-level-history-override.md)
- [Framework integration](./guides/framework-integration.md)
- [Using another history](./guides/using-another-history.md)

## Why yet-another X ?

Because I never encountered one that made sense to me:

> [!Important]
> Routing and history are separate concerns.
> 
> A history can be unique or cascaded across the client-side app, it should not impact routing.

My opinion: use one history per app.

You want routing? Fine: provide the history to watch changes, you'll get the active route in return.

You want some nested routing? Perfect, provide the history and a base path, you'll get the active route in return.

You want to mix browser, hash and/or memory routing? Fine: provide a different history per-router.

All in pure JS, testable with no framework, adaptable to every framework.<br>
Testable: No jsdom needed, no {your framework}-library, no nothing. Aim at that 3ms test 😉.

Fully type-safe and type-driven for mad-typers. It comes with a double-function cost, but still worth it!<br>
Now you have the treat of typed path parameters 😛

## Contributing

Any contribution is welcome, fork and PR 😁

```sh
# clone the repo, then
npm ci
npm run test
```
