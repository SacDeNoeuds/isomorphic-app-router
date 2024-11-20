import { match } from 'path-to-regexp'
import { PathToRegexpAdapter } from '../src/adapter/PathToRegexp'
import { mockHistory } from '../src/history-mock'
import { RouterFactory } from '../src/router'

const history = mockHistory('/')
const Router = RouterFactory({
  adapter: PathToRegexpAdapter(match),
  getPathname: () => history.url.pathname,
  onHistoryChange: history.listen,
})

type YourRoute =
  | { name: 'Home' }
  | { name: 'Product', id: number }
  | { name: 'NotFound', matchPathname?: string }

const basePath = '/:locale'

const router = Router<YourRoute>({ NotFound: () => ({ name: 'NotFound' }) })({
  basePath,
  routes: {
    '/': ({ params }) => ({ name: 'Home' }),
    // "{/*}?" indicates to also match sub-paths like /product/1/hello/world
    // See syntax possibilities at https://github.com/pillarjs/path-to-regexp
    '/product/:id{/*}?': ({ params, pathname }) => {
      pathname // "/product/:id"
      const id = Number(params.id)
      // For whatever reason, you can return `undefined`
      // it will resolve to "not found"
      // In our case, if the product id is not a number, let’s return `undefined`
      return Number.isNaN(id) ? undefined : { name: 'Product', id }
    },
  }
})


router.route // YourRoute
router.onRouteChanged((newRoute, oldRoute) => {})
router.destroy() // remove all `onRouteChanged` listeners.