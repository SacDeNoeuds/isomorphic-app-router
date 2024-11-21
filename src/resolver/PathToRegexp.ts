import type { match as matchFromLib } from 'path-to-regexp'
import { RouteResolver } from '../Resolver'

export const PathToRegexpResolver = (match: typeof matchFromLib): RouteResolver => ({
  match: (pathname, currentPath) => {
    const fn = match(pathname)
    const data = fn(currentPath)
    return data ? { params: data.params as any, pathname } : undefined
  }
})