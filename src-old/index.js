require('dotenv').config()
const Discord = require('discord.js')
const config = require('./config')
const { commandStore } = require('./commands/command-list')

const INTENTS = Discord.Intents.FLAGS
const discordClient = new Discord.Client({
  intents: [
    INTENTS.DIRECT_MESSAGES,
    INTENTS.GUILDS,
    INTENTS.GUILD_MESSAGES,
    INTENTS.GUILD_PRESENCES,
    INTENTS.GUILD_MESSAGE_REACTIONS,
  ],
})

// const commands = [{
//   name: 'ping',
//   description: 'Replies with Pong!'
// }]
//
// const rest = new REST({ version: '9' }).setToken(config.discordApiToken);
//
// (async () => {
//   try {
//     console.log('Started refreshing application (/) commands.')
//
//     await rest.put(
//       Routes.applicationGuildCommands(config.clientId, config.serverId),
//       { body: commands }
//     )
//
//     console.log('Successfully reloaded application (/) commands.')
//   } catch (error) {
//     console.error(error)
//   }
// })()

discordClient.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  const command = commandStore.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

discordClient.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.login(config.discordApiToken)
