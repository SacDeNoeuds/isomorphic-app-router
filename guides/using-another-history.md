---
title: 6. Using another history
category: Guide
---

## Introduction

It may happen that you do not use any `history` package. This is also supported by `isomorphic-app-router`.

## Example of custom history

```ts
// <repo>/library/history.ts
export const myHistory = {
  pathname: '/',
  addListener: (listener) => {},
  removeListener: (listener) => {},
  push: (newPath) => {},
  // …
}
```

## Registering our custom history

```ts
// <repo>/library/router.ts
import { RouterBuilderFactory, YourResolver } from 'isomorphic-app-router'
import { myHistory } from '<repo>/library/history'

export const RouterBuilder = RouterBuilderFactory({
  resolver: YourResolver,
  history: {
    location: {
      get pathname() {
        return myHistory.pathname
      }
    }
    listen: (listener) => {
      myHistory.addListener(listener)
      const cleanup = () => myHistory.removeListener(listener)
      return cleanup
    }
  }
})
```
