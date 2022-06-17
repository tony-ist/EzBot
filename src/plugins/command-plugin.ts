import ListenerPlugin from './listener-plugin'
import Discord from 'discord.js'
import { commandStore } from '../commands/command-list'
import { I18n } from '../i18n'
import logger from '../logger'

const log = logger('plugins/command')

export default class CommandPlugin implements ListenerPlugin {
  async onInteractionCreate(interaction: Discord.Interaction): Promise<void> {
    if (!interaction.isCommand()) return

    // interaction.commandName is a string. There is no guarantee that it is of AllCommandNames type.
    const command = commandStore.get(interaction.commandName as any)
    if (command === undefined || command === null) {
      log.debug(`Command is ${command}`)
      return
    }

    const userName = interaction.user.username

    log.info(`User "${userName}" issued "/${interaction.commandName}"`)

    try {
      await command.execute(interaction)
    } catch (error) {
      log.error(`Error while executing command "${interaction.commandName}:"`, error)
      // TODO: Fix "The reply to this interaction has already been sent or deferred."
      await interaction.reply({ content: I18n.errorOnCommand(), ephemeral: true })
      throw error
    }
  }
}
