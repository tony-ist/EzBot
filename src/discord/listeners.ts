import Discord from 'discord.js'
import { commandStore } from '../commands/command-list'

function registerInteractionCreate(discordClient: Discord.Client): void {
  discordClient.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    const command = commandStore.get(interaction.commandName)

    if (command === undefined || command === null) {
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  })
}

function registerReady(discordClient: Discord.Client): void {
  discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
  })
}

export function registerDiscordListeners(discordClient: Discord.Client): void {
  registerInteractionCreate(discordClient)
  registerReady(discordClient)
}
