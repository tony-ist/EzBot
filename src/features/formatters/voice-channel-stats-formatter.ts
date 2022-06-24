import { I18n } from '../../i18n'
import { formatMs, getMonday } from '../../utils/date'
import { VoiceChannelStatsModel } from '../../models/voice-channel-stats'
import { Guild } from 'discord.js'
import logger from '../../logger'

const log = logger('features/voice-channel-stats-formatter')

export async function voiceChannelStatsFormatter(guild: Guild) {
  const messageParts: string[] = [I18n.commands.stats.voiceChannel.thisWeek()]
  const thisMonday = getMonday(new Date())
  const voiceChannelStats = await VoiceChannelStatsModel.find({ week: thisMonday })

  for (const stat of voiceChannelStats) {
    const channel = await guild.channels.fetch(stat.voiceChannelId)

    if (channel === null) {
      log.info(`Trying to display stats for non-existing channel with id "${stat.voiceChannelId}".`)
      continue
    }

    const channelName = channel.name
    const timeString = formatMs(stat.timeMilliseconds)
    messageParts.push(I18n.commands.stats.voiceChannel.channel({ channelName }))
    messageParts.push(timeString)
  }

  if (messageParts.length === 1) {
    return I18n.commands.stats.voiceChannel.noStats()
  } else {
    return messageParts.join('\n')
  }
}
