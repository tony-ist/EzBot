import { NullMap } from '../null-map'

describe('NullMap', () => {
  it('should be empty when initialized without args', () => {
    const emptyNullMap = new NullMap()
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(Array.from(emptyNullMap['map']).length).toBe(0)
  })

  it('should not be empty when initialized with non-empty array', () => {
    const array: Array<[string, Date]> = [['1', new Date(2022)], ['2', new Date(2023)]]
    const nullMap = new NullMap(array)
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(Array.from(nullMap['map'])).toStrictEqual(array)
  })

  it('should return null if key is not found', () => {
    const array: Array<[string, Date]> = [['1', new Date(2022)], ['2', new Date(2023)]]
    const nullMap = new NullMap(array)
    expect(nullMap.get('3')).toBeNull()
  })

  it('should return key if key is found', () => {
    const array: Array<[string, Date]> = [['1', new Date(2022)], ['2', new Date(2023)]]
    const nullMap = new NullMap(array)
    expect(nullMap.get('2')).toStrictEqual(array[1][1])
  })

  it('should not handle array key', () => {
    const array: Array<[[string, string], Date]> = [[['1', '11'], new Date(2022)], [['2', '22'], new Date(2023)]]
    const nullMap = new NullMap(array)
    expect(nullMap.get(['2', '22'])).toBeNull()
  })
})
