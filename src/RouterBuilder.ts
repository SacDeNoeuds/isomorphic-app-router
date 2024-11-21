import { PathParameters } from "./path-parameters"
import { ResolveWith, RouteResolver } from "./Resolver"
import { createRouter, HistoryForRouter, Router } from "./Router"
import { Simplify } from "./types"

export interface RouteData<Path extends string> {
  params: Simplify<PathParameters<Path>>
  pathname: Path
}

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
  orNotFound: (handler: () => Route) => Router<Route, PathByName>
}

export interface RouterBuilderFactoryDeps<RouteShape> {
  history: HistoryForRouter
  compare?: (a: RouteShape, b: RouteShape) => boolean
  resolver: RouteResolver
}

export function RouterBuilderFactory<RouteShape = any>(
  deps: RouterBuilderFactoryDeps<RouteShape>,
) {
  const makeResolveRoute = ResolveWith<any>(deps.resolver)

  return function RouterBuilder<Route extends RouteShape>(history?: HistoryForRouter): RouterBuilder<
    Route,
    "",
    {}
  > {
    const collected = {
      basePath: "",
      pathsByName: {} as Record<string, string>,
      routes: new Map<string, (data: RouteData<any>) => Route>(),
      isSameRoute:
        deps.compare ?? ((() => false) as (a: Route, b: Route) => boolean),
    }
    const builder: RouterBuilder<Route, string, {}> = {
      withBasePath: (basePath) => {
        collected.basePath = basePath
        return builder as any
      },
      compareWith: (isSameRoute) => {
        collected.isSameRoute = isSameRoute
        return builder as any
      },
      set: (name, path, handler) => {
        collected.routes.set(path, handler)
        collected.pathsByName[name] = path
        return builder as any
      },
      orNotFound: (fallback) => {
        return createRouter<Route, Record<string, string>>({
          pathByName: collected.pathsByName,
          history: history ?? deps.history,
          resolve: makeResolveRoute(
            collected.basePath,
            collected.routes,
            fallback,
          ),
          compare: collected.isSameRoute ?? deps.compare,
        })
      },
    }

    return builder
  }
}
