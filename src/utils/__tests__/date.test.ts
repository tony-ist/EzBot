import { formatMs, getMonday } from '../date'

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

  describe('formatMs', () => {
    it.each([
      [0, '0:00:00:00'],
      [1, '0:00:00:00'],
      [1000, '0:00:00:01'],
      [60000, '0:00:01:00'],
      [3600000, '0:01:00:00'],
      [86400000, '1:00:00:00'],
      [864000000, '10:00:00:00'],
    ])('should format %s milliseconds', (timeMs, formattedString) => {
      expect(formatMs(timeMs)).toBe(formattedString)
    })
  })
})
