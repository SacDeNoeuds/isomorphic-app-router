# single-page-app-router

Super tiny dependency-free vanilla JS routing library to represent your routing states in pure JS rather than framework-based stuff. Because it is framework-agnostic, it can be adapted to _every_ framework.

## Recipes

### Top-Level Routes

```ts
import { RouterBuilder } from '<repo>/library/router'

type YourRoute =
  | { name: 'Home' }
  | { name: 'Product' }
  | null // for not found. You could also provide { name: 'NotFound' }

const router = RouterBuilder<YourRoute>()
  // let you be guided by the types ;)
  .set('home', '/', () => ({ name: 'Home' }))
  .set('product', '/product/:id', ({ params }) => {
    params // { id: string } <- parameters are inferred from the path.
    const id = Number(params.id)
    return Number.isNaN(id)
      ? null // for not found
      : { name: 'Product', id }
  })
  .orNotFound(() => null) // required _at the end_

router.route // YourRoute, the active route
router.onChange((nextRoute, previousRoute) => {})

router.linkTo.home() // parameter-less path, no arg required
router.linkTo.product({ id: '2' })
```

### Nested Routes

Let’s take the same example as before and add it a base path:

```ts
type YourRoute = …
const router = RouterBuilder<YourRoute>()
  .withBasePath('/:locale') // must be provided _first_
  .set('home', '/', ({ params }) => {
    params // { locale: string } <- basePath parameters also get inferred
  })
  .set('product', '/product/:id', ({ params }) => {
    params // { locale: string, id: string } <- basePath _and_ path parameters get inferred
  })
  .orNotFound(…)
```

### Path Syntax

I based the library on web standards, namely [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API). Which itself is based its syntax on [path-to-regexp](https://github.com/pillarjs/path-to-regexp). Therefore, their syntax prevails.

The [MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) website is an **excellent** place to start. Here are a few tips though:

- `/post/*` will match `/post/`, `/post/1` & `/post/1/2` ; but not `/post` :warning:
  To match `/post` => `post{/*}?`
- `/post{/:id}?` matches `/post` & `/post/1`, not `/post/1/2`
- Regex groups like `/books/(\\d+)` can be used but break intellisense of path parameters
- For nested routers, type the home as `{/}?` :wink:

### Overriding the history for one router

```ts
import { createMemoryHistory } from 'history'

const historyForMyTabs = createMemoryHistory()
const router = RouterBuilder<SomeRoute>(historyForMyTabs) // <- tada
```

## Convinced? Let’s install

### With [history](https://npmjs.com/package/history)

### With `URLPattern` resolver

[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) is a great native API that still hasn’t reached baseline at the time writing, therefore you’ll need to use polyfill.

```bash
npm i -S single-page-app-router history urlpattern-polyfill
```

```ts
// <repo>/library/router.ts
import { RouterBuilderFactory, URLPatternResolver } from 'single-page-app-router'
import { createBrowserHistory } from 'history'
import "urlpattern-polyfill"

export const history = createBrowserHistory() // to make and export elsewhere.

export const RouterBuilder = RouterBuilderFactory({
  history,
  resolver: URLPatternResolver,
})
```

### With `PathToRegex` resolver

[`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) is a great tool, `URLPattern` syntax is actually _based_ on path-to-regexp. It is more lightweight than `urlpattern-polyfill` but is no web standard.

```bash
npm i -S single-page-app-router history path-to-regexp
```

```ts
// <repo>/library/router.ts
import { RouterBuilderFactory, PathToRegexpResolver } from 'single-page-app-router'
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
import { RouterBuilderFactory, YourResolver } from 'single-page-app-router'
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

### Enforcing a route shape

You can force a general route shape. This is useful to force a stable discriminant. Let’s say our discriminant is "name":

```ts
type RouteShape = { name: string }

export const RouterBuilder = RouterBuilderFactory<RouteShape>(…)

type MyRoute = { type: 'home' } | …
const router = RouterBuilder<Route>() // fails!
```

### Providing a default route equality check

This allows you to provide a generic equality function, like `_.isEqual` or some hash-equality function.

```ts
// <repo>/library/router.ts
export const RouterBuilder = RouterBuilderFactory({
  // …
  isSameRoute: (a, b): boolean => {
    // some logic
  },
  isSameRoute: _.isEqual,
  isSameRoute: hashEqual,
  // …
})
```

## Framework integrations

### React Hook

```ts
const useRouter = <R extends Route<any, any>>(router: R) => {
	const [route, setRoute] = useState(router.route)
	useEffect(() => {
		const unsubscribe = router.onChanged((newRoute) => {
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
		const unsubscribe = router.onChanged((newRoute) => {
			set(newRoute)
		})
		return unsubscribe
	})
}
```

## Reference

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
   * router.onChanged((newRoute, previousRoute) => {…})
   */
  onChanged: (
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

What is injected in the route callback.

```ts
export interface RouteData<BasePath extends string, Path extends string> {
  params: PathParameters<`${BasePath}${Path}`>
  pathname: string
}

const router = RouterBuilder<MyRoute>()
  .withBasePath('/:locale')
  .set('home', '{/}?': (data: RouteData<'/:locale{/}?'>) => {
    data // { params: { locale: string }, pathname: '/:locale{/}?' }
  })
  .set('product', '/product/:id': (data: RouteData<'/:locale/product/:id'>) => {
    data // { params: { locale: string, id: string }, pathname: '/:locale/product/:id' }
  })
```

## Why yet-another X ?

Because I never encountered one that made sense to me:

> [!Important]
> Routing and history are separate concerns.
> 
> A history can be unique or cascaded across the client-side app, it should not impact routing.
>
> My opinion: use one history per app.

You want routing? Fine: provide the history to watch changes, you'll get the active route in return.

You want some nested routing? Perfect, provide the history and a base path, you'll get the active route in return.

You want to mix browser, hash and/or memory routing? no problem.

All in pure JS, testable with no framework, adaptable to every framework.

Testable: No jsdom needed, no {your framework}-library, no nothing. Aim at that 3ms test 😉.

Fully type-safe and type-driven for mad-typers. It comes with a double-function cost, but still worth it!

Now you have the treat of typed path parameters :stuck_out_tongue:

## Contributing

Any contribution is welcome, fork and PR :grin:

```sh
# clone the repo
npm ci
npm run test
```
