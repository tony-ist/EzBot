import { SlashCommandBuilder } from '@discordjs/builders'
import { CL } from '../i18n'
import { Command } from '../types'
import { commandList } from './command-list'

const commandName = 'help'
type CommandWithDescription = keyof (typeof CL.commands)

export const helpCommand: Command = {
  builder: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(CL.commands.help.description()),

  async execute(interaction) {
    const helps = commandList.map(command => {
      const commandName = command.builder.name as CommandWithDescription
      if (typeof CL.commands[commandName]?.description === 'function') {
        const commandDescription = CL.commands[commandName].description()
        const formattedCommandName = '`' + commandName + '`'
        return `${formattedCommandName}: ${commandDescription}`
      }
      return ''
    })
    const message = helps.join('\n')

    await interaction.reply(message)
  },
}
