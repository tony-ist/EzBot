import { SlashCommandBuilder } from '@discordjs/builders'
import i18n from '../i18n/i18n-init'
import { Command } from '../types'

const commandName = 'ping'

export const pingCommand: Command = {
  builder: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(i18n.__(`help.${commandName}`)),

  async execute(interaction) {
    await interaction.reply('Pong!')
  },
}
