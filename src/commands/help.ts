import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import { commandList } from './command-list'

const COMMAND_NAME = 'help'
export const helpCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.help.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    const helps = commandList.map(command => {
      const commandDescription = I18n.commands[command.name].description()
      const formattedCommandName = '`/' + command.name + '`'
      return `${formattedCommandName}: ${commandDescription}`
    })
    const message = helps.join('\n')
    await commandInteraction.reply(message)
  },
}
