import { setTimeout as nodeSetTimeout } from 'node:timers'

export function setTimeout(callback: () => void, ms?: number) {
  return nodeSetTimeout(callback, ms)
}
