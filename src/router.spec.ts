import { match } from "path-to-regexp"
import "urlpattern-polyfill"
import { describe, expect, it } from "vitest"
import { mockHistory } from "./history.mock"
import { RouteResolver } from "./Resolver"
import { PathToRegexpResolver } from "./resolver/PathToRegexp"
import { URLPatternResolver } from "./resolver/URLPattern"
import { RouterBuilderFactory } from "./RouterBuilder"

function factory(resolver: RouteResolver) {
  return function bootAt(path: string) {
    const history = mockHistory(path)
    type RouteShape = { name: string }
    const RouterBuilder = RouterBuilderFactory<RouteShape>({
      resolver,
      history,
      compare: (a, b) => a.name === b.name,
    })
    return [RouterBuilder, history] as const
  }
}

describe.each<[string, RouteResolver]>([
  ["URLPattern", URLPatternResolver],
  ["PathToRegexp", PathToRegexpResolver(match)],
])("Router with %s adapter", (_, adapter) => {
  describe.each<[string, string]>([
    ["top-level", ""],
    ["nested", "/test/:toto"],
  ])("%s router", (_, basePath) => {
    const bootAt = factory(adapter)
    type Route =
      | { name: "Home" }
      | { name: "Product"; id: number }
      | { name: "NotFound" }

    function makeRouter(initialPath: string) {
      const [RouterBuilder, history] = bootAt(initialPath)
      const router = RouterBuilder<Route>()
        .withBasePath(basePath)
        .set('home', "/", () => ({ name: "Home" }))
        .set('product', "/product/:id", ({ params }) => {
          const id = Number(params.id)
          return Number.isNaN(id)
            ? { name: "NotFound" }
            : { name: "Product", id }
        })
        .or(() => ({ name: "NotFound" }))
      return [router, history] as const
    }

    describe.each<{ path: string; whenNavigatingFrom: string; route: Route }>([
      {
        path: `${basePath}/`,
        whenNavigatingFrom: "/unknown",
        route: { name: "Home" },
      },
      {
        path: `${basePath}/product/1`,
        whenNavigatingFrom: "/",
        route: { name: "Product", id: 1 },
      },
      {
        path: `${basePath}/product/abc`,
        whenNavigatingFrom: "/unknown",
        route: { name: "NotFound" },
      },
      {
        path: `${basePath}/unknown`,
        whenNavigatingFrom: "/",
        route: { name: "NotFound" },
      },
    ])("$route.name", (config) => {
      it(`resolves ${config.path} to route ${config.route.name}`, () => {
        const [router] = makeRouter(config.path)
        expect(router.route).toEqual(config.route)
      })

      it(`navigates from ${config.whenNavigatingFrom} to ${config.path} and resolves to ${config.route.name}`, () => {
        const [router, history] = makeRouter(config.whenNavigatingFrom)
        history.push(config.path)
        expect(router.route).toEqual(config.route)
      })
    })
  })
})

describe("isSameRoute", () => {
  type Route = { name: "Home" } | { name: "Product"; id: number } | null
  const history = mockHistory("/test")

  describe("at builder level", () => {
    const RouterBuilder = RouterBuilderFactory({
      history,
      resolver: PathToRegexpResolver(match),
    })

    const isSameRoute = (a: Route, b: Route) => {
      switch (a?.name) {
        case "Product":
          return b?.name === a.name && a.id === b.id
        default:
          return a?.name === b?.name
      }
    }

    const Router = () => {
      return RouterBuilder<Route | null>()
        .compareWith(isSameRoute)
        .set('home', "/", () => ({ name: "Home" }))
        .set('product', "/product/:id", ({ params }) => ({
          name: "Product",
          id: Number(params.id),
        }))
        .or(() => null)
    }

    it.each<string>(["/product/2", "/"])(
      "resolves the '%s' page once",
      (newPath) => {
        const router = Router()
        const changes = new Set<Route>() // keeps the references !
        
        router.onChange((newRoute) => changes.add(newRoute))
        history.push(newPath)
        expect(changes.size).toBe(1)
        history.push(newPath)
        expect(changes.size).toBe(1)
      },
    )

    it("resolves to a new product page when parameter changes", () => {
      const router = Router()
      const changes = new Set<Route>()
      router.onChange((newRoute) => changes.add(newRoute))
      history.push("/product/1")
      expect(changes.size).toBe(1)
      history.push("/product/2")
      expect(changes.size).toBe(2)
    })
  })

  describe("at factory level", () => {
    type RouteShape = { name: string; id?: unknown } | null
    const history = mockHistory("/test")
    const RouterBuilder = RouterBuilderFactory<RouteShape>({
      history,
      resolver: PathToRegexpResolver(match),
      compare: (a, b) => a?.name === b?.name && a?.id === b?.id,
    })
    const Router = () => {
      return RouterBuilder<Route>()
        .set('home', "/", () => ({ name: "Home" }))
        .set('product', "/product/:id", ({ params }) => ({
          name: "Product",
          id: Number(params.id),
        }))
        .or(() => null)
    }

    it.each<string>(["/product/2", "/"])(
      "resolves the '%s' page once",
      (newPath) => {
        const router = Router()
        const changes = new Set<Route>() // keeps the references !

        router.onChange((newRoute) => changes.add(newRoute))
        history.push(newPath)
        expect(changes.size).toBe(1)
        history.push(newPath)
        expect(changes.size).toBe(1)
      },
    )

    it("resolves to a new product page when parameter changes", () => {
      const router = Router()
      const changes = new Set<Route>()
      router.onChange((newRoute) => changes.add(newRoute))
      history.push("/product/1")
      expect(changes.size).toBe(1)
      history.push("/product/2")
      expect(changes.size).toBe(2)
    })
  })
})
