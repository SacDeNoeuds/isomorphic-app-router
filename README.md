![Package Size](https://deno.bundlejs.com/badge?q=isomorphic-app-router)

Super tiny dependency-free vanilla JS routing library to represent your routing states in pure JS rather than framework-based stuff.

Because it is framework-agnostic, it can be adapted to _every_ framework.

<!-- TOC -->

- [Recipes/Usage](#recipesusage)
  - [Basics](#basics)
  - [Real-life example](#real-life-example)
  - [Nested Routes](#nested-routes)
  - [Providing a router-level route comparator](#providing-a-router-level-route-comparator)
  - [Overriding the history for one router](#overriding-the-history-for-one-router)
  - [Enforcing route shapes](#enforcing-route-shapes)
  - [Providing a global route comparator](#providing-a-global-route-comparator)
  - [Path Syntax](#path-syntax)
- [Installation](#installation)
  - [With history](#with-history)
    - [With URLPattern resolver](#with-urlpattern-resolver)
    - [With PathToRegex resolver](#with-pathtoregex-resolver)
  - [With a custom history](#with-a-custom-history)
- [Framework integrations](#framework-integrations)
  - [React Hook](#react-hook)
  - [Svelte](#svelte)
  - [Other framework](#other-framework)
- [API Reference](#api-reference)
  - [Router](#router)
  - [RouteData<Path>](#routedatapath)
  - [RouteBuilder](#routebuilder)
- [Why yet-another X ?](#why-yet-another-x-)
- [Contributing](#contributing)

<!-- /TOC -->

## Recipes/Usage

### Basics

```ts
import { RouterBuilder } from '<repo>/library/router'

// `YourRoute` is for you to define, you have full control.
// You can add `path`, `url`, params, etc.
// See more real-life example below.
type YourRoute = {
  routeName: string
}
const router = RouterBuilder<YourRoute>()
  // optional
  .withBasePath('/lang/:locale') // can contain parameters
  .compareWith((a, b) => a.routeName === b.routeName)
  // define your routes:
  .set('route1', '/path/to/route', () => ({ routeName: 'route1' }))
  .set('…', '/path/…', () => {…})
  // finish building the router:
  .or(() => ({ routeName: 'not found' }))

router.linkTo.route1() // => "/path/to/route"
router.route           // { routeName: string }
router.onChange((nextRoute, previousRoute) => {…})
```

### Real-life example

```ts
import { RouterBuilder } from '<repo>/library/router'

type Route =
  | { name: 'Home' }
  | { name: 'Product', productId: number }
  | null // for not found

const router = RouterBuilder<Route>()
  .set('home', '/', () => ({ name: 'Home' }))
  .set('product', '/product/:id', ({ params }) => {
    const productId = Number(params.id)       // params: { id: string }

    return Number.isNaN(productId)
      ? null                                  // not found
      : { name: 'Product', productId }
  })
  .or(() => null) // required _at the end_

router.linkTo.home() // parameter-less path, no arg required
router.linkTo.product({ id: '2' }) // TS forcefully asks for the route parameters
```

### Nested Routes

The same real-life router can be given a base path super easily:

```ts
type YourRoute = …
const router = RouterBuilder<YourRoute>()
  .withBasePath('/lang/:locale') // must be provided _first_
  .set('home', '/', ({ params }) => {
    params                  // { locale: string }
  })
  .set('product', '/product/:id', ({ params }) => {
    params                  // { locale: string, id: string }
  })
  .or(…)

router.linkTo.home({ locale: 'fr' }) // basePath params are also required
router.linkTo.product({ locale: 'fr', id: '2' })
```

### Providing a router-level route comparator

It overrides **completely** the (optional) global route comparator.

```ts
type YourRoute = { name: 'Home' } | { name: 'Product' }

const router = RouterBuilder<YourRoute>()
  .withBasePath('/hello/world') // optional
  .compareWith((a, b) => a.name === b.name)
  // (a: YourRoute, b: YourRoute) => boolean
```

### Overriding the history for one router

```ts
import { createMemoryHistory } from 'history'

const historyForMyTabs = createMemoryHistory()
const router = RouterBuilder<SomeRoute>({ history historyForMyTabs }) // <- tada
```

### Enforcing route shapes

You can force a global route shape. This is useful to force a stable discriminant. Let’s say our discriminant is "name":

```ts
type RouteShape = { name: string }

// See installation steps for more details on `RouterBuilderFactory`

export const RouterBuilder = RouterBuilderFactory<RouteShape>({…})
```

### Providing a global route comparator

This allows you to provide a generic equality function, like `_.isEqual` or some hash-equality function.

```ts
type RouteShape = { name: string, id?: unknown }

// See installation steps for more details on `RouterBuilderFactory`

export const RouterBuilder = RouterBuilderFactory<RouteShape>({
  // (a: RouteShape, b: RouteShape) => boolean
  compare: (a, b) => a.name === b.name && a?.id === b?.id,
  compare: _.isEqual,
  compare: hashEqual,
})
```

### Path Syntax

I based the library on web standards, namely [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API). Which itself is based its syntax on [path-to-regexp](https://github.com/pillarjs/path-to-regexp). Therefore, their syntax prevails.

The [MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) website is an **excellent** place to start. Here are a few tips though:

- `/post/*` will match `/post/`, `/post/1` & `/post/1/2` ; but not `/post` :warning:
  To match `/post` => `post{/*}?`
- `/post{/:id}?` matches `/post` & `/post/1`, not `/post/1/2`
- Regex groups like `/books/(\\d+)` can be used but break intellisense of path parameters
- For nested routers, type the home as `{/}?` :wink:


## Installation

### With [history](https://npmjs.com/package/history)

#### With `URLPattern` resolver

[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) is a great native API that still hasn’t reached baseline at the time writing, therefore you’ll need to use polyfill.

```bash
npm i -S isomorphic-app-router history urlpattern-polyfill
```

```ts
// <repo>/library/router.ts
import { RouterBuilderFactory, URLPatternResolver } from 'isomorphic-app-router'
import { createBrowserHistory } from 'history'
import "urlpattern-polyfill"

export const history = createBrowserHistory() // to make and export elsewhere.

export const RouterBuilder = RouterBuilderFactory({
  history,
  resolver: URLPatternResolver,
})
```

#### With `PathToRegex` resolver

[`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) is a great tool, `URLPattern` syntax is actually _based_ on path-to-regexp. It is more lightweight than `urlpattern-polyfill` but is no web standard.

```bash
npm i -S isomorphic-app-router history path-to-regexp
```

```ts
// <repo>/library/router.ts
import { RouterBuilderFactory, PathToRegexpResolver } from 'isomorphic-app-router'
import { createBrowserHistory } from 'history'
import { match } from 'path-to-regexp'

export const history = createBrowserHistory() // to make and export elsewhere.

export const RouterBuilder = RouterBuilderFactory({
  history,
  resolver: PathToRegexpResolver(match),
})
```

### With a custom history

```ts
// <repo>/library/history.ts
export const myHistory = {
  pathname: '/',
  addListener: (listener) => {},
  removeListener: (listener) => {},
  push: (newPath) => {…},
  // …
}

// <repo>/library/router.ts
import { RouterBuilderFactory, YourResolver } from 'isomorphic-app-router'
import { myHistory } from '<repo>/library/history'

export const RouterBuilder = RouterBuilderFactory({
  resolver: YourResolver,
  history: {
    location: {
      get pathname() {
        return myHistory.pathname
      }
    }
    listen: (listener) => {
      myHistory.addListener(listener)
      const cleanup = () => myHistory.removeListener(listener)
      return cleanup
    }
  }
})
```

## Framework integrations

### React Hook

```ts
const useRouter = <R extends Route<any, any>>(router: R) => {
  const [route, setRoute] = useState(router.route)
  useEffect(() => {
    const unsubscribe = router.onChange((newRoute) => {
      setRoute(newRoute)
    })
    return unsubscribe
  }, [router])
  return route
}
```

### Svelte

```ts
import { readable } from 'svelte'

const RouterToSvelteStore = <R extends Router<any, any>>(router: R) => {
  return readable(router.route, (set) => {
    const unsubscribe = router.onChange((newRoute) => {
      set(newRoute)
    })
    return unsubscribe
  })
}
```

### Other framework

I am sure you will find a way to make it work.

## API Reference

### `Router`

```ts
type Unsubscribe = () => void

export interface Router<Route, PathByName extends Record<string, string>> {
  /**
   * The current active route
   */
  route: Route
  /**
   * A helper to build links based on the provided path patterns and route name
   * @example
   * const router = RouterBuilder().set('home', '/', () => {…}).
   * router.linkTo // { home: () => string }
   */
  linkTo: { [Name in keyof PathByName]: LinkTo<PathByName[Name]> },
  /**
   * Gets triggered when the active route changed and is different than the previous one
   * according to an optionally provided `isSameRoute`.
   * @example
   * const router = RouterBuilder<Route>().set('home', '/', () => {…})
   * router.onChange((newRoute, previousRoute) => {…})
   */
  onChange: (
    listener: (newRoute: Route, previousRoute: Route) => unknown,
  ) => Unsubscribe // () => void
  /**
   * Removes all listeners, notably to history.
   * Particularly useful for nested routers.
   * @example
   * const router = RouterBuilder<Route>().set('home', '/', () => {…})
   * 
   * const cleanup = () => {
   *   // …
   *   router.destroy()
   * }
   */
  destroy: () => void
}
```

### `RouteData<Path>`

What is injected in the route handler.

```ts
export interface RouteData<BasePath extends string, Path extends string> {
  params: PathParameters<`${BasePath}${Path}`>
  pathname: `${BasePath}${Path}`
}

const router = RouterBuilder<MyRoute>()
  .withBasePath('/:locale')
  .set('home', '{/}?': (data: RouteData<'/:locale{/}?'>) => {
    data // { params: { locale: string }, pathname: '/:locale{/}?' }
  })
  .set('product', '/product/:id': (data: RouteData<'/:locale/product/:id'>) => {
    data // { params: { locale: string, id: string }, pathname: '/:locale/product/:id' }
  })
  .or(() => ({ name: 'NotFound' }))
```

### `RouteBuilder`

Implementation of the builder pattern to output a `Router`.

```ts
export interface RouterBuilder<
  Route,
  BasePath extends string,
  PathByName extends Record<string, string>,
> {
  withBasePath: <BasePath extends string>(
    basePath: BasePath,
  ) => RouterBuilder<Route, BasePath, PathByName>

  compareWith: (
    compare: (a: Route, b: Route) => boolean,
  ) => Omit<RouterBuilder<Route, BasePath, PathByName>, "withBasePath">

  set: <Name extends string, Path extends string>(
    name: Exclude<Name, keyof PathByName>,
    path: Path,
    handler: (data: RouteData<`${BasePath}${Path}`>) => Route,
  ) => Omit<
    RouterBuilder<
      Route,
      BasePath,
      PathByName & { [Key in Name]: `${BasePath}${Path}` }
    >,
    "withBasePath" | "isSame"
  >

  or: (handler: () => Route) => Router<Route, PathByName>
}
```

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
Now you have the treat of typed path parameters :stuck_out_tongue:

## Contributing

Any contribution is welcome, fork and PR :grin:

```sh
# clone the repo, then
npm ci
npm run test
```
