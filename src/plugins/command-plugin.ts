import ListenerPlugin from './listener-plugin'
import Discord from 'discord.js'
import { commandStore } from '../commands/command-list'
import { I18n } from '../i18n'

export default class CommandPlugin implements ListenerPlugin {
  discordClient: Discord.Client

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient
  }

  async onInteractionCreate(interaction: Discord.Interaction): Promise<void> {
    if (!interaction.isCommand()) return

    // interaction.commandName is a string. There is no guarantee that it is of AllCommandNames type.
    const command = commandStore.get(interaction.commandName as any)
    if (command === undefined || command === null) {
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      await interaction.reply({ content: I18n.errorOnCommand(), ephemeral: true })
      throw error
    }
  }
}
