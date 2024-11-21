import { match } from 'path-to-regexp'
import { RouterBuilderFactory } from '../src/RouterBuilder'
import { mockHistory } from '../src/history-mock'
import { PathToRegexpResolver } from '../src/resolver/PathToRegexp'

const history = mockHistory('/')
const RouterBuilder = RouterBuilderFactory({
  resolver: PathToRegexpResolver(match),
  history,
})

type YourRoute =
  | { name: 'Home' }
  | { name: 'Product', id: number }
  | { name: 'NotFound', matchPathname?: string }

const basePath = '/:locale'

const router = RouterBuilder<YourRoute>()
  .withBasePath(basePath)
  .set('home', '/', ({ params }) => ({ name: 'Home' }))
  .set('product', '/product/:id{/*}?', ({ params, pathname }) => {
    // "{/*}?" indicates to also match sub-paths like /product/1/hello/world
    // See syntax possibilities at https://github.com/pillarjs/path-to-regexp

    pathname // "/:locale/product/:id"
    const id = Number(params.id)
    // For whatever reason, you can return `undefined`
    // it will resolve to "not found"
    // In our case, if the product id is not a number, let’s return `undefined`
    return Number.isNaN(id)
      ? { name: 'NotFound', matchPathname: pathname }
      : { name: 'Product', id }
  })
  .orNotFound(() => ({ name: 'NotFound' }))


router.route // YourRoute
router.onChange((newRoute, oldRoute) => {})
router.destroy() // remove all `onRouteChanged` listeners.