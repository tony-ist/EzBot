export function assertSingle<T>(array: T[]) {
  if (array.length !== 1) {
    throw new Error(`Array should contain only single element, but contains: ${array.length}`)
  }

  return array[0]
}
