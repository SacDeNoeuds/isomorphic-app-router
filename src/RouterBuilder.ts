import type { PathParameters } from "./path-parameters"
import { ResolveWith, type RouteResolver } from "./Resolver"
import { createRouter, type HistoryForRouter, type Router } from "./Router"
import type { Simplify } from "./types"

/** @category Reference/RouterBuilder */
export interface RouteData<Path extends string> {
  params: Simplify<PathParameters<Path>>
  pathname: Path
}

/** @category Reference/RouterBuilder */
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

/** @category Reference/RouterBuilder */
export interface RouterBuilderFactoryDeps<RouteShape> {
  history: HistoryForRouter
  compare?: (a: RouteShape, b: RouteShape) => boolean
  resolver: RouteResolver
}

/** @category Reference/RouterBuilder */
export function RouterBuilderFactory<RouteShape = any>(
  deps: RouterBuilderFactoryDeps<RouteShape>,
) {
  const makeResolveRoute = ResolveWith<any>(deps.resolver)

  return function RouterBuilder<Route extends RouteShape>({
    history,
  }: { history?: HistoryForRouter } = {}): RouterBuilder<Route, "", {}> {
    const collected = {
      basePath: "",
      pathsByName: {} as Record<string, string>,
      routes: new Map<string, (data: RouteData<any>) => Route>(),
      compare:
        deps.compare ?? ((() => false) as (a: Route, b: Route) => boolean),
    }
    const builder: RouterBuilder<Route, string, {}> = {
      withBasePath: (basePath) => {
        collected.basePath = basePath
        return builder as any
      },
      compareWith: (compare) => {
        collected.compare = compare
        return builder as any
      },
      set: (name, path, handler) => {
        collected.routes.set(path, handler)
        collected.pathsByName[name] = path
        return builder as any
      },
      or: (fallback) => {
        return createRouter<Route, Record<string, string>>({
          pathByName: collected.pathsByName,
          history: history ?? deps.history,
          resolve: makeResolveRoute(
            collected.basePath,
            collected.routes,
            fallback,
          ),
          compare: collected.compare ?? deps.compare,
        })
      },
    }

    return builder
  }
}
