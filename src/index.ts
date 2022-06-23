import Discord from 'discord.js'
import config from './config'
import logger from './logger'
import mongoose from 'mongoose'
import ReadyPlugin from './plugins/ready-plugin'
import WrongChannelPlugin from './plugins/wrong-channel-plugin'
import CommandPlugin from './plugins/command-plugin'
import RolePlugin from './plugins/role-plugin'
import { wrapErrorHandling } from './plugins/listener-plugin'
import ConnectChannelPlugin from './plugins/connect-channel-plugin'
import AddGamesPlugin from './plugins/add-games-plugin'
import WelcomePlugin from './plugins/welcome-plugin'
import RemoveActivityPlugin from './plugins/remove-activity-plugin'
import { getVersion } from './utils/get-version'
import VoiceChannelStatsPlugin from './plugins/voice-channel-stats-plugin'

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
      INTENTS.GUILD_MEMBERS,
    ],
  })

  log.debug('Registering discord client listeners...')

  const readyPlugin = new ReadyPlugin()
  discordClient.on('ready', wrapErrorHandling(readyPlugin.onReady.bind(readyPlugin)))

  const wrongChannelPlugin = new WrongChannelPlugin()
  discordClient.on('presenceUpdate', wrapErrorHandling(wrongChannelPlugin.onPresenceUpdate.bind(wrongChannelPlugin)))

  const commandPlugin = new CommandPlugin()
  discordClient.on('interactionCreate', wrapErrorHandling(commandPlugin.onInteractionCreate.bind(commandPlugin)))

  const rolePlugin = new RolePlugin()
  discordClient.on('messageReactionAdd', wrapErrorHandling(rolePlugin.onMessageReactionAdd.bind(rolePlugin)))
  discordClient.on('messageReactionRemove', wrapErrorHandling(rolePlugin.onMessageReactionRemove.bind(rolePlugin)))

  const connectChannelPlugin = new ConnectChannelPlugin()
  discordClient.on('interactionCreate', wrapErrorHandling(connectChannelPlugin.onInteractionCreate.bind(connectChannelPlugin)))

  const addGamesPlugin = new AddGamesPlugin()
  discordClient.on('interactionCreate', wrapErrorHandling(addGamesPlugin.onInteractionCreate.bind(addGamesPlugin)))

  const welcomePlugin = new WelcomePlugin()
  discordClient.on('guildMemberAdd', wrapErrorHandling(welcomePlugin.onGuildMemberAdd.bind(welcomePlugin)))

  const removeActivityPlugin = new RemoveActivityPlugin()
  discordClient.on('interactionCreate', wrapErrorHandling(removeActivityPlugin.onInteractionCreate.bind(removeActivityPlugin)))

  const voiceChannelStatsPlugin = new VoiceChannelStatsPlugin()
  discordClient.on('voiceStateUpdate', wrapErrorHandling(voiceChannelStatsPlugin.onVoiceStateUpdate.bind(voiceChannelStatsPlugin)))

  await discordClient.login(config.discordApiToken)

  if (process.env.NODE_ENV === 'production') {
    const authorId = '158576177009786880'
    const author = await discordClient.users.fetch(authorId)
    await author?.send(`Bot version ${getVersion()} successfully deployed!`)
  }

  log.debug('Bot client id:', discordClient.user?.id)
  log.debug('Bot version:', getVersion())
  log.debug('Discord client logged in')
}

run().catch((err) => log.error('Application init error', err))
