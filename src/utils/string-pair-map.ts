/**
 * Behaves similar to the usual Map<K, V> except that keys are pairs of strings.
 * Also returns null instead of undefined if element is not found.
 */
export class StringPairMap<V> {
  private readonly map = new Map<string, Map<string, V>>()

  constructor(array?: Array<[string, string, V]>) {
    if (array === undefined) {
      return
    }

    for (const triple of array) {
      this.set(triple[0], triple[1], triple[2])
    }
  }

  /**
   * Returns the element corresponding to the string pair or null if it does not exist.
   * @param left First key of the string pair
   * @param right Second key of the string pair
   */
  get(left: string, right: string) {
    const rightMap = this.map.get(left)

    if (rightMap === undefined) {
      return null
    } else {
      return rightMap.get(right) ?? null
    }
  }

  /**
   * Sets the value corresponding to the string pair. If value is null, does nothing.
   * @param left First key of the string pair
   * @param right Second key of the string pair
   * @param value Value to set corresponding to the string pair
   */
  set(left: string, right: string, value: V) {
    if (value === null) {
      return
    }

    const rightMap = this.map.get(left)

    if (rightMap === undefined) {
      this.map.set(left, new Map([[right, value]]))
    } else {
      rightMap.set(right, value)
    }
  }

  /**
   * Deletes the value corresponding to the string pair. Returns `true` if values existed and was deleted
   * or `false` if it did not exist.
   * @param left First key of the string pair
   * @param right Second key of the string pair
   */
  delete(left: string, right: string) {
    const rightMap = this.map.get(left)

    if (rightMap === undefined) {
      return false
    } else {
      return rightMap.delete(right)
    }
  }

  /**
   * Returns array of triplets, where first element is first key, second element is second key, third element is value.
   */
  entriesArray() {
    const result: Array<[string, string, V]> = []

    for (const left of this.map.keys()) {
      const rightMap = this.map.get(left)

      if (rightMap === undefined) {
        continue
      }

      for (const right of rightMap.keys()) {
        const value = rightMap.get(right)

        if (value === undefined) {
          continue
        }

        if (rightMap.get(right) !== undefined) {
          result.push([left, right, value])
        }
      }
    }

    return result
  }
}
