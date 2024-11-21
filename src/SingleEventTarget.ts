export type Unsubscribe = () => void;
type ListenerShape = (...args: any[]) => unknown

export interface SingleEventTarget<T extends ListenerShape> {
  subscribe: (listener: T) => Unsubscribe
  dispatch: (...args: Parameters<T>) => void
  destroy: () => void;
}

export function SingleEventTarget<T extends ListenerShape>(): SingleEventTarget<T> {
  const listeners = new Set<T>()
  return {
    subscribe: (listener: T) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    dispatch: (...args) => listeners.forEach((listener) => listener(...args)),
    destroy: () => listeners.clear(),
  }
}