import Discord from 'discord.js'
import config from './config'
import logger from './logger'
import { registerDiscordListeners } from './discord/listeners'
import mongoose from 'mongoose'

const log = logger('index')

async function run(): Promise<void> {
  log.info('Connecting to mongodb...')
  // await mongoose.connect(config.dbConnectionUrl)
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
  // registerDiscordListeners(discordClient)

  await discordClient.login(config.discordApiToken)
  log.debug('Discord client logged in')

  const guilds = await discordClient.guilds.fetch()
  console.log(guilds)
  const guild = discordClient.guilds.resolve('194696398413758464')
  console.log(guild)
  const emojis = await guild?.emojis.fetch()
  console.log(emojis)

  if (emojis === undefined) {
    throw new Error('emojis is undefined')
  }

  const emojiIds = emojis.map(emoji => {
    if (typeof emoji.name !== 'string') {
      throw new Error('emoji.name is not a string')
    }
    return { [emoji.name]: emoji.id }
  })

  console.log(emojiIds)

  const roles = await guild?.roles.fetch()
  console.log(roles)

  if (roles === undefined) {
    throw new Error('roles is undefined')
  }

  const roleIds = roles.map(role => {
    if (typeof role.name !== 'string') {
      throw new Error('role.name is not a string')
    }
    return { [role.name]: role.id }
  })

  console.log(roleIds)
}

run().catch((err) => log.error('Application init error', err))
