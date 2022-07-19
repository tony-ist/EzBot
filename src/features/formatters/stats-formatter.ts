import { Guild } from 'discord.js'
import { gameStatsFormatter } from './game-stats-formatter'
import { voiceChannelStatsFormatter } from './voice-channel-stats-formatter'

export async function statsFormatter(guild: Guild) {
  const messageParts = [
    await gameStatsFormatter(),
    await voiceChannelStatsFormatter(guild),
  ]

  return messageParts.join('\n\n')
}
