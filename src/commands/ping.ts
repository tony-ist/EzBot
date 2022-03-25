import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../types'

export const pingCommand: Command = {
  builder: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(interaction) {
    await interaction.reply('Pong!')
  },
}
