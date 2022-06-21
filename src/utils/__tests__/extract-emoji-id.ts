import { extractEmojiId } from '../emoji'

describe('extractEmojiId', () => {
  it.each([
    'Emoji',
    ':)',
    ')))',
    'With additional string 😋',
    '😋😋',
    '📙',
    '◀',
    '◀️',
    '<:123:dummy>',
    '<:dummy:123><:dummy:123>',
  ])('should return null for %s', (inputStr) => {
    expect(extractEmojiId(inputStr)).toBeNull()
  })

  it.each([
    ['<:dummy:123>', '123'],
    ['<:SC2:234>', '123'],
  ])('should extract emoji id for %s', (input, output) => {
    expect(extractEmojiId(input)).toBe(output)
  })
})
