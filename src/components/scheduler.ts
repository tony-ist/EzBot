import NodeSchedule from 'node-schedule'
import Discord, { TextChannel } from 'discord.js'
import logger from '../logger'
import { SettingsModel } from '../models/settings'
import { statsFormatter } from '../features/formatters/stats-formatter'
import config from '../config'

const END_OF_THE_WEEK_CRON = '50 23 * * 0'
const log = logger('components/scheduler')

export function scheduleWeeklyStats(discordClient: Discord.Client) {
  NodeSchedule.scheduleJob(END_OF_THE_WEEK_CRON, async () => {
    try {
      log.info('Executing scheduled weekly stats')

      const settings = await SettingsModel.findOne()

      if (settings === null) {
        throw new Error('settings is null')
      }

      if (settings.statsTextChannelId === undefined || settings.statsTextChannelId === null) {
        throw new Error(`settings.statsTextChannelId is ${settings.statsTextChannelId}`)
      }

      const statsTextChannel = discordClient.channels.resolve(settings.statsTextChannelId)

      if (statsTextChannel === null) {
        throw new Error('statsTextChannel is null')
      }

      if (!(statsTextChannel instanceof TextChannel)) {
        throw new Error('statsTextChannel is not a text channel')
      }

      const guild = discordClient.guilds.resolve(config.guildId)

      if (guild === null) {
        throw new Error('guild is null')
      }

      const message = await statsFormatter(guild)
      await statsTextChannel.send(message)

      log.info(`Scheduled weekly stats were posted in channel "${statsTextChannel.name}"`)
    } catch (error) {
      log.error('Error during scheduled weekly stats task:', error)
    }
  })
}
