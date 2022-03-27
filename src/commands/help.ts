import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { CL } from '../i18n'
import { Command } from '../types'
import { commandList } from './command-list'

const COMMAND_NAME = 'help'
export const helpCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(CL.commands.help.description()),

  async execute(commandInteraction: CommandInteraction) {
    const helps = commandList.map(command => {
      const commandDescription = CL.commands[command.name].description()
      const formattedCommandName = '`' + command.name + '`'
      return `${formattedCommandName}: ${commandDescription}`
    })
    const message = helps.join('\n')
    await commandInteraction.reply(message)
  },
}
