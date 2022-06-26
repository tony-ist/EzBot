/**
 * Behaves just as usual Map<K, V>, but when the element is not found it returns null instead of undefined.
 */
// TODO: Rewrite using "extends Map<K, V>"
export class NullMap<K, V> {
  private readonly map: Map<K, V>

  constructor(array?: Array<[K, V]>) {
    this.map = new Map(array)
  }

  set(key: K, value: V) {
    this.map.set(key, value)
  }

  get(key: K) {
    return this.map.get(key) ?? null
  }

  delete(key: K) {
    return this.map.delete(key)
  }
}
