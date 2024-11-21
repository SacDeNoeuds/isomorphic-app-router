import { match } from 'path-to-regexp'
import "urlpattern-polyfill"
import { describe, expect, it } from 'vitest'
import { RouteResolver } from '../Resolver'
import { PathToRegexpResolver } from './PathToRegexp'
import { URLPatternResolver } from './URLPattern'

describe.each<[string, RouteResolver]>([
  ['PathToRegexpResolver', PathToRegexpResolver(match)],
  ['URLPatternResolver', URLPatternResolver],
])('%s', (_, resolver) => {
  it.each<[string, string, Record<string, string>]>([
    ['/product/:id', '/product/1', { id: '1' }],
    ['/product', '/product', {}],
    ['/', '/', {}],
  ])('extracts params from %s', (pathname, currentPath, expected) => {
    const params = resolver.match(pathname, currentPath)
    expect(params).toEqual({ params: expected, pathname })
  })
})