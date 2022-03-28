import { tryExtractSingleDiscordEmoji } from '../try-extract-single-discord-emoji'

describe('tryExtractSingleDiscordEmoji', () => {
  it.each([
    'Emoji',
    ':)',
    ')))',
    'With additional string 😋',
    '😋😋',
    '<:dummy:123><:dummy:123>',
  ])('should return null for %s', (inputStr) => {
    expect(tryExtractSingleDiscordEmoji(inputStr)).toBeNull()
  })

  it.each([
    ['📙', '📙'],
    [' 📙 ', '📙'],
    [' <:dummy:123>', '123'],
  ])('should extract emoji for %s', (input, output) => {
    expect(tryExtractSingleDiscordEmoji(input)).toBe(output)
  })
})
