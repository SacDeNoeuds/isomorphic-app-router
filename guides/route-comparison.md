---
title: 2. Route Comparison
category: Guide
---

## Introduction

Often, we do not want the route mapper to be re-executed if the same route matched the current history location.

This can be achieved at global and router level.

## At global level

This allows you to provide a generic equality function, like `_.isEqual` or some hash-equality function.

It also works seamlessly if you registered a global [route shape](./enforcing-a-route-shape.md).

```ts
import { RouterBuilderFactory } from 'isomorphic-app-router'

type RouteShape = { name: string, id?: unknown }

export const RouterBuilder = RouterBuilderFactory<RouteShape = unknown>({
  // (a: RouteShape, b: RouteShape) => boolean
  compare: (a, b) => a.name === b.name && a?.id === b?.id,
  compare: _.isEqual,
  compare: hashEqual,
})
```

## At route level

It overrides the (optional) global route comparator.

```ts
type Route =
  | { name: 'Home' }
  | { name: 'Product', productId: number }
  | { name: 'NotFound' }

const router = RouterBuilder<Route>()
  .compareWith((a, b) => a.name === b.name)
  // (a: Route, b: Route) => boolean
  .set(…)
  .set(…)
  .or(…)
```
