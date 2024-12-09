import type { RouteResolver } from "../Resolver"

/** @category Reference/Resolver */
export const URLPatternResolver: RouteResolver = {
  match: (pathname, currentPath) => {
    // @ts-ignore
    const pattern = new URLPattern({ pathname })
    const data = pattern.exec(currentPath, "http://t.t")
    const params = data?.pathname?.groups
    return params ? { params, pathname } : undefined
  },
}
