import { PathParameters } from './path-parameters'
import { Simplify } from './types'

export type Unsubscribe = () => void
export type OnHistoryChange = (listener: () => unknown) => Unsubscribe

export type RouterListener<Route> = (newRoute: Route, previousRoute: Route) => unknown

export interface RouterAdapter {
  match: (pathname: string, currentPath: string) => RouteData<string, string> | undefined
}

export interface Router<Route extends object> {
  route: Route
  onRouteChanged: (
    listener: (newRoute: Route, previousRoute: Route) => unknown,
  ) => Unsubscribe
  destroy: () => void
}

export interface RouteData<Path extends string, BasePath extends string> {
  params: Simplify<PathParameters<`${BasePath}${Path}`>>
  pathname: string
}

export interface RouterFactoryOptions<RouteShape extends object> {
  getPathname: () => string
  onHistoryChange: OnHistoryChange
  adapter: RouterAdapter
  isSameRoute?: (a: RouteShape, b: RouteShape) => boolean
}

export interface CreateRouterOptions<Route, BasePath extends string = string> {
  NotFound: (data: RouteData<string, BasePath>) => Route
  isSameRoute?: (a: Route, b: Route) => boolean
}

export type RouterRoutes<
  Route,
  BasePath extends string,
  RoutePaths extends string,
> = {
  [Path in RoutePaths]: (data: RouteData<Path, BasePath>) => Route | undefined
}

export function RouterFactory<RouteShape extends object>({
  getPathname,
  onHistoryChange,
  isSameRoute: globalIsSameRoute = () => false,
  adapter,
}: RouterFactoryOptions<RouteShape>) {
  return function createRouter<Route extends RouteShape>({
    NotFound,
    isSameRoute = globalIsSameRoute,
  }: CreateRouterOptions<Route>) {
    return function createRouterRoutes<
      RoutePaths extends string,
      BasePath extends string,
    >({ basePath, routes }: { basePath?: BasePath, routes: RouterRoutes<Route, BasePath, RoutePaths> }): Router<Route> {
      const resolve = Resolver(adapter, basePath ?? '', routes as any, NotFound)
      const listeners = new Set<RouterListener<Route>>()
      const dispatch = (newRoute: Route, previousRoute: Route) => {
        listeners.forEach((listener) => listener(newRoute, previousRoute))
      }

      const unsubscribeFromHistory = onHistoryChange(() => {
        const previousRoute = router.route
        const newRoute = resolve(getPathname())
        if (isSameRoute(previousRoute, newRoute)) return
        router.route = newRoute

        dispatch(newRoute, previousRoute)
      })

      const router: Router<Route> = {
        route: resolve(getPathname()),
        onRouteChanged: (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        destroy: () => {
          unsubscribeFromHistory()
          listeners.clear()
        },
      }
      return router
    }
  }
}

function Resolver<Route>(
  adapter: RouterAdapter,
  basePath: string,
  routes: Record<string, (data: RouteData<string, string>) => Route | undefined>,
  fallback: (data: RouteData<string, string>) => Route,
) {
  return function resolve(currentPath: string): Route {
    for (const [pathname, make] of Object.entries(routes)) {
      const data = adapter.match(basePath + pathname, currentPath)
      if (data) return (make as any)(data) ?? fallback(data)
    }
    return fallback({ params: {}, pathname: currentPath })
  }
}
