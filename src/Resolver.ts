import { RouteData } from "./RouterBuilder"

export interface RouteResolver {
  match: (
    pathname: string,
    currentPath: string,
  ) => RouteData<string> | undefined
}

export type MakeResolveRoute<Route> = (
  basePath: string,
  routes: Map<string, (data: RouteData<string>) => Route>,
  fallback: (data: RouteData<string>) => Route,
) => ResolveRoute<Route>

export type ResolveRoute<Route> = (currentPath: string) => Route

export function ResolveWith<Route>(resolver: RouteResolver) {
  return function makeResolve(
    basePath: string,
    routes: Map<string, (data: RouteData<string>) => Route>,
    fallback: (data: RouteData<string>) => Route,
  ) {
    return function resolve(currentPath: string): Route {
      for (const [pathname, make] of routes.entries()) {
        const data = resolver.match(basePath + pathname, currentPath)
        if (data) return make(data)
      }
      return fallback({ params: {}, pathname: currentPath })
    }
  }
}
