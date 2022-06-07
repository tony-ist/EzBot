import { addObject, clearIdMap, getObjectId, hasObject } from '../id-map'

describe('id-map', () => {
  beforeEach(() => {
    clearIdMap()
  })

  it('should add 1 new object', () => {
    const newObject = { test: 'test' }
    addObject(newObject)
    expect(getObjectId(newObject)).toBe(1)
  })

  it('should add 2 new objects', () => {
    const newObject1 = { test: 'test1' }
    const newObject2 = { test: 'test2' }
    addObject(newObject1)
    addObject(newObject2)
    expect(getObjectId(newObject2)).toBe(2)
  })

  it('should add alike objects', () => {
    const newObject = { test: 'test' }
    const oldObject = { test: 'test' }
    addObject(newObject)
    addObject(oldObject)
    expect(getObjectId(oldObject)).toBe(2)
  })

  it('should not add old objects', () => {
    const oldObject = { test: 'test' }
    addObject(oldObject)
    addObject(oldObject)
    expect(getObjectId(oldObject)).toBe(1)
  })

  it('should have added objects', () => {
    const obj = { test: 'test' }
    addObject(obj)
    expect(hasObject(obj)).toBe(true)
  })

  it('should not have not added objects', () => {
    const obj = { test: 'test' }
    const obj2 = { test: 'test' }
    addObject(obj)
    expect(hasObject(obj2)).toBe(false)
  })
})
