import Discord from 'discord.js'
import config from './config'
import logger from './logger'
import { registerDiscordListeners } from './discord/listeners'

const log = logger('index')

async function run(): Promise<void> {
  log.info('Starting application...')

  log.debug('Initialize discord client')
  const INTENTS = Discord.Intents.FLAGS
  const discordClient = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
      INTENTS.DIRECT_MESSAGES,
      INTENTS.GUILDS,
      INTENTS.GUILD_MESSAGES,
      INTENTS.GUILD_PRESENCES,
      INTENTS.GUILD_MESSAGE_REACTIONS,
      INTENTS.GUILD_VOICE_STATES,
    ],
  })
  log.debug('Register discrod client listeners')
  registerDiscordListeners(discordClient)

  log.debug('Discord client login started')
  await discordClient.login(config.discordApiToken)

  log.info('Application started')
}

run().catch((err) => log.error('Application init error', err))
