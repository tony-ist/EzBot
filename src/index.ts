import Discord from 'discord.js'
import config from './config'
import { registerDiscordListeners } from './discord/listeners'

async function run(): Promise<void> {
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
  registerDiscordListeners(discordClient)

  await discordClient.login(config.discordApiToken)
}

// eslint-disable-next-line no-console
run().catch(console.error)
