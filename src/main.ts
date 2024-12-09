/**
 * @module
 * @document ../guides/nested-router.md
 * @document ../guides/route-comparison.md
 * @document ../guides/enforcing-a-route-shape.md
 * @document ../guides/router-level-history-override.md
 * @document ../guides/using-another-history.md
 * @document ../guides/framework-integration.md
 */
export { PathToRegexpResolver } from './resolver/PathToRegexp'
export { URLPatternResolver } from './resolver/URLPattern'
export type {
  Router,
  RouterListener
} from "./Router"
export {
  RouterBuilderFactory,
  type RouteData,
  type RouterBuilder,
  type RouterBuilderFactoryDeps
} from "./RouterBuilder"
export type { Unsubscribe } from './SingleEventTarget'

