
export type PathParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : Route extends `${string}(${string}`
  ? ParamsDictionary // TODO: handling for regex parameters
  : Route extends `${string}:${infer Rest}`
  ? 
      (GetRouteParameter<Rest> extends never
        ? ParamsDictionary
        : GetRouteParameter<Rest> extends `${infer ParamName}?`
        ? { [P in ParamName]?: string }
        : { [P in GetRouteParameter<Rest>]: string }) &
        (Rest extends `${GetRouteParameter<Rest>}${infer Next}`
          ? PathParameters<Next>
          : unknown)
  : {}

// --- PathParameters ---
type ParamsDictionary = Record<string, string | undefined>
type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<
    RemoveTail<
      RemoveTail<
        RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
        `.${string}`
      >,
      `{${string}`
    >,
    '?'
  >,
  '}'
>
type RemoveTail<
  S extends string,
  Tail extends string,
> = S extends `${infer P}${Tail}` ? P : S

// type Test = PathParameters<'/authenticate/code/:email/:accountId{/:code}?'>
// type Test = PathParameters<'/authenticate'>

// type Test2 = Is<Test, Record<string, never>>
