import { match } from 'path-to-regexp'
import "urlpattern-polyfill"
import { describe, expect, it } from 'vitest'
import { RouterAdapter } from '../router'
import { PathToRegexpAdapter } from './PathToRegexp'
import { URLPatternAdapter } from './URLPattern'

describe.each<[string, RouterAdapter]>([
  ['PathToRegexpAdapter', PathToRegexpAdapter(match)],
  ['URLPatternAdapter', URLPatternAdapter],
])('%s', (_, adapter) => {
  it.each<[string, string, Record<string, string>]>([
    ['/product/:id', '/product/1', { id: '1' }],
    ['/product', '/product', {}],
    ['/', '/', {}],
  ])('extracts params from %s', (pathname, currentPath, expected) => {
    const params = adapter.match(pathname, currentPath)
    expect(params).toEqual({ params: expected, pathname })
  })
})