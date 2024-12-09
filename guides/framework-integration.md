---
title: 5. Framework integration
category: Guide
---

## Introduction

That’s beautiful thank you, but how do I use it in my project?

### React Hook

```ts
import type { Router } from 'isomorphic-app-router'
import { useState } from 'react'

const useRouterRoute = <Route>(router: Router<Route, unknown>) => {
  const [route, setRoute] = useState(router.route)
  useEffect(() => {
    const unsubscribe = router.onChange(setRoute)
    return unsubscribe
  }, [router])
  return route
}
```

### Vue

```ts
import { ref, onUnmounted } from 'vue'
import type { Router } from 'isomorphic-app-router'

export function useRouterRoute<Route>(router: Router<Route, unknown>) {
  const route = ref(router.route)

  const unsubscribe = router.onChange((nextRoute) => {
    route.value = nextRoute
  })

  onUnmounted(unsubscribe)

  return route
}
```

### Svelte

```ts
import { readable } from 'svelte'

const getRouterRouteAsSvelteStore = <Route>(router: Router<Route, unknown>) => {
  return readable(router.route, (set) => {
    const unsubscribe = router.onChange(set)
    return unsubscribe
  })
}
```

### SolidJS

```ts
import type { Router } from 'isomorphic-app-router'
import { createSignal, onCleanup } from 'solid-js'

export function useRouterRoute<Route>(router: Router<Route, unknown>) {
  const [route, setRoute] = createSignal(router.route)
  const unsubscribe = router.onChange((nextRoute) => setRoute(nextRoute))
  // or directly:
  const unsubscribe = router.onChange(setRoute)

  onCleanup(unsubscribe)
  return route
}
```

### Other framework

I think most frameworks are covered, I hope this package’s API should be familiar enough to use in any other framework.

If however your framework is missing and you struggle building the adapter, please create an issue.