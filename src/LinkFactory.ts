import type { PathParameters } from "./path-parameters"
import type { If } from "./types"

type IsEmpty<T> = {} extends T ? true : false
type Args<Params> = If<IsEmpty<Params>, [], [params: Params]>
export type LinkArgs<Path extends string> = Args<PathParameters<Path>>

export type LinkTo<Path extends string> = (...args: Args<PathParameters<Path>>) => string

export function getLinkTo<Path extends string>(path: Path, ...[params]: Args<PathParameters<Path>>) {
  let revived: string = path.replace(new RegExp("{.+}?", "g"), "")
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (!value) return
    revived = revived.replace(new RegExp(`:${key}`, "g"), value)
  })
  return revived
}
