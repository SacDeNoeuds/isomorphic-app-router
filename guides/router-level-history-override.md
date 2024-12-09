---
title: 4. Router-level history override
category: Guide
---

## Introduction

In some special cases – like tabs –, you may need to override the history at the router-level. To provide an in-memory or hash router instead of the browser one for instance.

## How to

### Overriding the history for one router

```ts
import { createMemoryHistory } from 'history'
import { RouterBuilder } from '<repo>/library/router'

const historyForMyTabs = createMemoryHistory()
const router = RouterBuilder<SomeRoute>({ history: historyForMyTabs })
```