import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'

const COMMAND_NAME = 'ping'

export const pingCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(I18n.commands.ping.description()),

  async execute(commandInteraction: CommandInteraction) {
    await commandInteraction.reply('pong!')
  },
}
