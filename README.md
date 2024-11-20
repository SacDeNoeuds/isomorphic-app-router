# single-page-app-router

## Installation

```bash
npm i -S single-page-app-router
```

You can use it with any history solution, the most common being [history](https://npmjs.com/package/history) I’ll showcase this one.

```ts
// <repo>/history.ts
import { createBrowserHistory } from 'history'

export const history = createBrowserHistory() // or Memory, or…

// <repo>/library/router.ts
import { RouterFactory } from 'browser-router'
import { PathToRegexpAdapter } from 'browser-router/adapter/PathToRegexp'
import { match } from 'path-to-regexp'
import { history } from '<repo>/history'

export const Router = RouterFactory<RouteShape>({
  adapter: PathToRegexpAdapter(match),
  getPathname: () => history.location.pathname,
  onHistoryChange: history.listen,
  // Optional: you can provide a global route equality check
  isSameRoute: (a, b) => isDeepEqual(a, b),
})

// Optional: You can force a general route shape.
// This is useful to force a stable discriminant.
// Let’s our discriminant is "name"
type RouteShape = { name: string }
```

## Recipes

### Top-Level Routes

```ts
import { Router } from '<repo>/router'

type YourRoute =
  | { name: 'Home' }
  | { name: 'Product', id: number }
  | { name: 'NotFound', matchPathname?: string }

const router = Router<YourRoute>({
  NotFound: () => ({ name: 'NotFound' })
})({
  '/': () => ({ name: 'Home' }),
  '/product/:id{/*}?': ({ params, pathname }) => {
    pathname // "/product/:id{/*}"
    const id = Number(params.id)
    // For whatever reason, you can return `undefined`
    // it will resolve to "not found"
    // In our case, if the product id is not a number, let’s return `undefined`
    return Number.isNaN(id) ? undefined : { name: 'Product', id }
  },
})


router.route // YourRoute
router.onRouteChanged((newRoute, oldRoute) => {…})
router.destroy() // remove all `onRouteChanged` listeners.
```

### Nested Routes

```ts
import { Router } from '<repo>/router'

type YourRoute =
  | { name: 'Home' }
  | { name: 'Product', id: number }
  | { name: 'NotFound', matchPathname?: string }

const basePath = '/:locale'

const router = Router<YourRoute>({
  NotFound: () => ({ name: 'NotFound' }),
})({
  basePath,
  routes: {
    '{/}?': ({ params }) => ({ name: 'Home' }),
    '/product/:id{/*}?': ({ params, pathname }) => {
      pathname // "/:locale/product/:id{/*}?"
      const id = Number(params.id)
      return Number.isNaN(id) ? undefined : { name: 'Product', id }
    },
  }
})


router.route // YourRoute
router.onRouteChanged((newRoute, oldRoute) => {})
router.destroy() // remove all `onRouteChanged` listeners.
```

## Framework integrations

### React Hook

```ts
const useRouter = (router: Router) => {
	const [route, setRoute] = useState(router.route)
	useEffect(() => {
		const unsubscribe = router.onRouteChanged((newRoute) => {
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

const RouterToSvelteStore = (router: Router) => {
	return readable(router.route, (set) => {
		const unsubscribe = router.onRouteChanged((newRoute) => {
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

export interface Router<Route extends object> {
  route: Route
  onRouteChanged: (
    listener: (newRoute: Route, previousRoute: Route) => unknown,
  ) => Unsubscribe
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

const router = Router<MyRoute>(…)({
  basePath: '/:locale',
  routes: {
    '{/}?': (data: RouteData<'/:locale', '{/}?'>) => {
      data // { params: { locale: string }, pathname: '/:locale{/}?' }
    },
    '/product/:id': (data: RouteData<'/:locale', '/product/:id'>) => {
      data // { params: { locale: string, id: string }, pathname: '/:locale/product/:id' }
    },
  }
})
```

### Path Syntax

I based the library on [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API), which itself is based on [path-to-regexp](https://github.com/pillarjs/path-to-regexp). Therefore, their syntax prevails.

The [MDN](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) website is an **excellent** place to start. Here are a few tips though:

- `/post/*` will match `/post/`, `/post/1` & `/post/1/2` ; but not `/post` :warning:
  To match `/post` => `post{/*}?`
- `/post{/:id}?` matches `/post` & `/post/1`, not `/post/1/2`
- Regex groups like `/books/(\\d+)` can be used but break intellisense of path parameters
- For nested routers, type the home as `{/}?` :wink:

## Why yet-another X ?

Because I never encountered one that made sense to me:

> [!Important] Routing and history are separate concerns.
  A history can be unique across the client-side app. Or you can nest them. I don’t care.
  Routing solves another problem _anyway_

You want routing? Fine: provide the history to watch changes, you'll get the active route in return.

You want some nested routing? Perfect, provide the history and a base path, you'll get the active route in return.

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
