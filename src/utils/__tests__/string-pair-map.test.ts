import { StringPairMap } from '../string-pair-map'

describe('StringPairMap', () => {
  describe('constructor', () => {
    it('should be empty when initialized without args', () => {
      const emptyStringPairMap = new StringPairMap()
      expect(emptyStringPairMap.entriesArray()).toStrictEqual([])
    })

    it('should not be empty when initialized with non-empty array', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      expect(map.entriesArray()).toStrictEqual(array)
    })
  })

  describe('get', () => {
    it('should return null if left key is not found', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      expect(map.get('3', '33')).toBeNull()
    })

    it('should return null if right key is not found', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      expect(map.get('1', '22')).toBeNull()
    })

    it('should return key if key is found', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      expect(map.get('1', '11')).toStrictEqual(new Date(2022))
    })
  })

  describe('delete', () => {
    it('should return true if key is deleted', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      expect(map.delete('1', '11')).toBe(true)
    })

    it('should return false if key is not deleted', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      expect(map.delete('1', '22')).toBe(false)
    })

    it('should delete existing key', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      map.delete('1', '11')
      expect(map.entriesArray()).toStrictEqual([array[1]])
    })

    it('should not delete non-existing key', () => {
      const array: Array<[string, string, Date]> = [['1', '11', new Date(2022)], ['2', '22', new Date(2023)]]
      const map = new StringPairMap(array)
      map.delete('1', '22')
      expect(map.entriesArray()).toStrictEqual(array)
    })
  })
})
