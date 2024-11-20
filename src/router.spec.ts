import { match } from 'path-to-regexp'
import "urlpattern-polyfill"
import { describe, expect, it } from 'vitest'
import { PathToRegexpAdapter } from './adapter/PathToRegexp'
import { URLPatternAdapter } from './adapter/URLPattern'
import { mockHistory } from './history-mock'
import { RouterAdapter, RouterFactory } from './router'

function factory(adapter: RouterAdapter) {
  return function bootAt(path: string) {
    const history = mockHistory(path)
    type RouteShape = { name: string }
    const Router = RouterFactory<RouteShape>({
      adapter,
      getPathname: () => history.url.pathname,
      onHistoryChange: history.listen,
      isSameRoute: (a, b) => a.name === b.name,
    })
    return [Router, history] as const
  }
}

describe.each<[string, RouterAdapter]>([
  ['URLPattern', URLPatternAdapter],
  ['PathToRegexp', PathToRegexpAdapter(match)],
])('Router with %s adapter', (_, adapter) => {
  describe.each<[string, string]>([
    ['top-level', ''],
    ['nested', '/test/:toto'],
  ])('%s router', (_, basePath) => {
    const bootAt = factory(adapter)
    type Route =
    | { name: 'Home' }
    | { name: 'Product', id: number }
    | { name: 'NotFound' }
    
    function makeRouter(initialPath: string) {
      const [Router, history] = bootAt(initialPath)
      const router = Router<Route>({ basePath, NotFound: () => ({ name: 'NotFound' }) })({
        '/': () => ({ name: 'Home' }),
        '/product/:id': ({ params }) => {
          const id = Number(params.id)
          return Number.isNaN(id) ? undefined : { name: 'Product', id };
        },
      })
      return [router, history] as const
    }

    describe.each<{ path: string, whenNavigatingFrom: string, route: Route }>([
      { path: `${basePath}/`, whenNavigatingFrom: '/unknown', route: { name: 'Home' } },
      { path: `${basePath}/product/1`, whenNavigatingFrom: '/', route: { name: 'Product', id: 1 } },
      { path: `${basePath}/product/abc`, whenNavigatingFrom: '/unknown', route: { name: 'NotFound' } },
      { path: `${basePath}/unknown`, whenNavigatingFrom: '/', route: { name: 'NotFound' } },
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