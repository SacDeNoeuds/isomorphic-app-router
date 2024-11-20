import { PathParameters } from './path-parameters'
import { IfNotNeverOr } from './types'

export type LinkToRoutes<RoutePaths> = {
  [Key in Extract<keyof RoutePaths, string>]: (...args: IfNotNeverOr<[params: PathParameters<Key>], []>) => string
}

export function linkToRoutes<RoutePaths extends string>(
  routes: Record<RoutePaths, () => unknown>,
): LinkToRoutes<RoutePaths> {
  const entries = Object.keys(routes).map((path) => {
    const revivePath = (params?: Record<string, unknown>) => {
      Object.entries(params ?? {}).forEach(([key, value]) => {
        path.replace(new RegExp(`:${key}`, "g"), String(value))
      })
    }
    return [path, revivePath] as const
  })
  return Object.fromEntries(entries) as unknown as LinkToRoutes<RoutePaths>
}