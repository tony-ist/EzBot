const UNICODE_EMOJI_REGEX = /^\p{Emoji}$/u // @See https://unicode.org/reports/tr51/#C1
const DISCORD_EMOJI_REGEX = /^<:\w+:(?<id>\d+)>$/
/**
 * Return emoji or discord emoji id if string contains only one emoji
 */
export function tryExtractSingleDiscordEmoji(stringWithSingleEmoji: string): string | null {
  const input = stringWithSingleEmoji.trim()
  if (input.match(UNICODE_EMOJI_REGEX) != null) {
    return input
  }
  const discordEmojiMatch = input.match(DISCORD_EMOJI_REGEX)
  const discordEmojiId = discordEmojiMatch?.groups?.id
  if (discordEmojiId !== undefined) {
    return discordEmojiId
  }
  return null
}
