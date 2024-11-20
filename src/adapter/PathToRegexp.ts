import type { match as matchFromLib } from 'path-to-regexp'
import { RouterAdapter } from '../router'

export const PathToRegexpAdapter = (match: typeof matchFromLib): RouterAdapter => ({
  match: (pathname, currentPath) => {
    const fn = match(pathname)
    const data = fn(currentPath)
    return data ? { params: data.params as any, pathname } : undefined
  }
})