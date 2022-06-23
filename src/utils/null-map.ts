export class NullMap<K, V> {
  private readonly map = new Map<K, V>()

  constructor(array?: Array<[K, V]>) {
    this.map = new Map(array)
  }

  set(key: K, value: V) {
    this.map.set(key, value)
  }

  get(key: K) {
    const value = this.map.get(key)

    if (value === undefined) {
      return null
    } else {
      return value
    }
  }

  delete(key: K) {
    this.map.delete(key)
  }
}
