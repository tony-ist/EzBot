let idMap = new WeakMap<object, number>()
let id = 1

export function addObject(obj: Object) {
  if (getObjectId(obj) === undefined) {
    idMap.set(obj, id)
    id++
    return id - 1
  }
}

export function getObjectId(obj: Object) {
  return idMap.get(obj)
}

export function hasObject(obj: Object) {
  return idMap.has(obj)
}

export function clearIdMap() {
  idMap = new WeakMap<object, number>()
  id = 1
}
