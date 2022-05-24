import ListenerPlugin from './listener-plugin'
import Discord from 'discord.js'
import logger from '../logger'

const log = logger('plugins/ready')

export default class ReadyPlugin implements ListenerPlugin {
  async onReady(discordClient: Discord.Client): Promise<void> {
    log.info(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
  }
}
