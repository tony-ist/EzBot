export const UNICODE_EMOJI_REGEX = /^\p{Emoji}$/u // @See https://unicode.org/reports/tr51/#C1
export const DISCORD_EMOJI_REGEX = /^<:\w+:(?<id>\d+)>$/
/**
 * Return custom emoji id
 */
export function extractEmojiId(customEmoji: string): string | null {
  const discordEmojiMatch = customEmoji.match(DISCORD_EMOJI_REGEX)
  const discordEmojiId = discordEmojiMatch?.groups?.id
  if (discordEmojiId !== undefined) {
    return discordEmojiId
  }
  return null
}
