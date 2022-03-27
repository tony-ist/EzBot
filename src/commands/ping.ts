import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { CL } from '../i18n'
import { Command } from '../types'

const COMMAND_NAME = 'ping'
export const pingCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(CL.commands.ping.description()),

  async execute(commandInteraction: CommandInteraction) {
    await commandInteraction.reply('pong!')
  },
}
