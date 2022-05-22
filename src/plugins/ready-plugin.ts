import ListenerPlugin from './listener-plugin'
import Discord from 'discord.js'
import logger from '../logger'

const log = logger('ready-plugin')

export default class ReadyPlugin implements ListenerPlugin {
  discordClient: Discord.Client

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient
  }

  async onReady(discordClient: Discord.Client): Promise<void> {
    log.info(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
  }
}
