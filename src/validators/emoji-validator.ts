import { DISCORD_EMOJI_REGEX, UNICODE_EMOJI_REGEX } from '../utils/emoji'

export function isValidEmoji(emoji: string) {
  if (emoji.match(UNICODE_EMOJI_REGEX) !== null) {
    return true
  }

  if (emoji.match(DISCORD_EMOJI_REGEX) !== null) {
    return true
  }

  return false
}
