export type If<Condition, True, False> = Condition extends true ? True : False
export type IsNever<T> = [T] extends [never] ? true : false
export type IfNotNeverOr<T, Fallback> = If<IsNever<T>, Fallback, T>
export type Simplify<T> = { [K in keyof T]: T[K] }
