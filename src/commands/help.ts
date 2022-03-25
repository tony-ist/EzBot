import { SlashCommandBuilder } from '@discordjs/builders'
import i18n from '../i18n/i18n-init'
import { Command } from '../types'
import { commandList } from './command-list'

const commandName = 'help'

export const helpCommand: Command = {
  builder: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(i18n.__(`help.${commandName}`)),

  async execute(interaction) {
    const helps = commandList.map(command => {
      const commandName = command.builder.name
      const commandHelp = i18n.__(`help.${commandName}`)
      return `\`/${commandName}\`: ${commandHelp}`
    })
    const message = helps.join('\n')

    await interaction.reply(message)
  },
}
