import Discord from 'discord.js'
import config from './config'
import logger from './logger'
import { registerDiscordListeners } from './discord/listeners'
import mongoose from 'mongoose'

const log = logger('index')

async function run(): Promise<void> {
  log.info('Connecting to mongodb...')
  await mongoose.connect(config.dbConnectionUrl)
  log.info('Successfully connected to mongodb!')

  const INTENTS = Discord.Intents.FLAGS
  log.debug('Initializing discord client...')
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
  log.debug('Registering discord client listeners...')
  registerDiscordListeners(discordClient)

  await discordClient.login(config.discordApiToken)
  log.debug('Discord client logged in')
}

run().catch((err) => log.error('Application init error', err))
