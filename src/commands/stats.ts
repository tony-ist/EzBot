import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import { VoiceChannelStatsModel } from '../models/voice-channel-stats'
import { formatMs, getMonday } from '../utils/date'
import logger from '../logger'

const COMMAND_NAME = 'stats'
const log = logger(`commands/${COMMAND_NAME}`)

export const statsCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.stats.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    const guild = commandInteraction.guild

    if (guild === null) {
      throw new Error('commandInteraction.guild is null')
    }

    const messageParts: string[] = [I18n.commands.stats.thisWeek()]
    const thisMonday = getMonday(new Date())
    const voiceChannelStats = await VoiceChannelStatsModel.find({ week: thisMonday })

    for (const stat of voiceChannelStats) {
      const channel = await guild.channels.fetch(stat.voiceChannelId)

      if (channel === null) {
        log.info(`Trying to display stats for non-existing channel with id "${stat.voiceChannelId}".`)
        continue
      }

      const channelName = channel.name
      messageParts.push(`**Channel: ${channelName}**`)
      messageParts.push(`Time spent: ${formatMs(stat.timeMilliseconds)}`)
    }

    if (messageParts.length === 0) {
      await commandInteraction.reply(I18n.commands.stats.noStats())
    } else {
      await commandInteraction.reply(messageParts.join('\n'))
    }
  },
}
