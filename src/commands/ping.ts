import { SlashCommandBuilder } from '@discordjs/builders'
import { CL } from '../i18n'
import { Command } from '../types'

const commandName = 'ping'

export const pingCommand: Command = {
  builder: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(CL.commands.ping.description()),

  async execute(interaction) {
    await interaction.reply('pong!')
  },
}
