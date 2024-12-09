import { type LinkArgs, getLinkTo } from "./LinkFactory"
import type { ResolveRoute } from "./Resolver"
import { SingleEventTarget, type Unsubscribe } from "./SingleEventTarget"

export interface Router<Route, PathByName extends Record<string, string>> {
  /**
   * The current active route
   */
  readonly route: Route
  /**
   * Gets triggered when the active route changed and is different than the previous one
   * according to an optionally provided `compareWith`.
   * @example
   * const router = RouterBuilder<Route>().set('home', '/', () => {…})
   * router.onChanged((newRoute, previousRoute) => {…})
   */
  readonly onChange: (
    listener: (newRoute: Route, previousRoute: Route) => unknown,
  ) => Unsubscribe
  /**
   * A helper to build links based on the provided path patterns and route name
   * @example
   * const router = RouterBuilder()
   *  .set('home', '/', () => {…})
   *  .set('product', '/product/:productId', …)
   *  .or(…)
   *
   * router.makeLinkTo('home') // '/'
   * router.makeLinkTo('product', { productId: '1' }) // '/product/1'
   */
  readonly makeLinkTo: <Name extends keyof PathByName>(
    name: Name,
    ...args: LinkArgs<PathByName[Name]>
  ) => string
  /**
   * Removes all listeners, notably to history.
   * Particularly useful for nested routers.
   * @example
   * const router = RouterBuilder<Route>().set('home', '/', () => {…}).or(…)
   *
   * const cleanup = () => {
   *   // …
   *   router.destroy()
   * }
   */
  readonly destroy: () => void
}

/**
 * Pick just what’s needed from the history.History type.
 */
export interface HistoryForRouter {
  readonly location: { readonly pathname: string }
  readonly listen: (listener: () => unknown) => () => void
}

export type RouterListener<Route> = (
  newRoute: Route,
  previousRoute: Route,
) => unknown

type CreateRouterOptions<Route, PathByName extends Record<string, string>> = {
  resolve: ResolveRoute<Route>
  history: HistoryForRouter
  compare?: (a: Route, b: Route) => boolean
  pathByName: PathByName
}
export function createRouter<Route, PathByName extends Record<string, string>>(
  deps: CreateRouterOptions<Route, PathByName>,
) {
  let route = deps.resolve(deps.history.location.pathname)
  const compare = deps.compare ?? (() => false)
  const target = SingleEventTarget<RouterListener<Route>>()

  const unsubscribeFromHistory = deps.history.listen(() => {
    const previousRoute = router.route
    const newRoute = deps.resolve(deps.history.location.pathname)
    if (compare(previousRoute, newRoute)) return
    route = newRoute

    target.dispatch(newRoute, previousRoute)
  })

  const router: Router<Route, PathByName> = {
    get route() {
      return route
    },
    makeLinkTo: (name, ...args) => getLinkTo(deps.pathByName[name], ...args),
    onChange: target.subscribe,
    destroy: () => {
      unsubscribeFromHistory()
      target.destroy()
    },
  }
  return router
}
