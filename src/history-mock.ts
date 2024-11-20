import { Unsubscribe } from './router'

type HistoryListener = (nextUrl: URL) => void

export interface HistoryMock {
  url: URL
  push: (url: URL | string) => void
  listen: (listener: HistoryListener) => Unsubscribe
}
export function mockHistory(initialPath: string): HistoryMock {
  const listeners = new Set<HistoryListener>()
  const dispatch = (url: URL) => listeners.forEach((listener) => listener(url))
  const history: HistoryMock = {
    url: new URL(initialPath, 'https://example.com'),
    push: (urlOrString) => {
      history.url = new URL(urlOrString, 'https://example.com')
      dispatch(history.url)
    },
    listen: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
  return history
}