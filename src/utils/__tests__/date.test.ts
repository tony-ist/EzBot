import { getMonday } from '../date'

describe('date', () => {
  describe('getMonday', () => {
    it.each([
      new Date(2022, 5, 20, 1, 2, 3, 4),
      new Date(2022, 5, 21, 1, 2, 3, 4),
      new Date(2022, 5, 22, 1, 2, 3, 4),
      new Date(2022, 5, 23, 1, 2, 3, 4),
      new Date(2022, 5, 24, 1, 2, 3, 4),
      new Date(2022, 5, 25, 1, 2, 3, 4),
      new Date(2022, 5, 26, 1, 2, 3, 4),
    ])('should return monday for date %s', (date) => {
      expect(getMonday(date)).toStrictEqual(new Date(2022, 5, 20))
    })
  })
})
