import { isValidEmoji } from '../emoji-validator'

describe('isValidEmoji', () => {
  it.each([
    'Emoji',
    ':)',
    ')))',
    'With additional string 😋',
    '😋😋',
    '<:dummy:123><:dummy:123>',
  ])('should return false for %s', (inputStr) => {
    expect(isValidEmoji(inputStr)).toBe(false)
  })

  it.each([
    '📙',
    '◀',
    '◀️',
    '<:dummy:123>',
  ])('should return true for %s', (emoji) => {
    expect(isValidEmoji(emoji)).toBe(true)
  })
})
