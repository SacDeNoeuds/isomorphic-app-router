---
title: 3. Enforcing a route shape
category: Guide
---

## Introduction

You can force a global route shape. This is useful to force a stable discriminant or conventions across teams/company.

Let’s say our discriminant is "name":

## How to

```ts
import { RouterBuilderFactory } from 'isomorphic-app-router'

type RouteShape = { name: string }

export const RouterBuilder = RouterBuilderFactory<RouteShape>({…})