import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import { getVersion } from '../utils/get-version'

const COMMAND_NAME = 'version'

export const versionCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.version.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    await commandInteraction.reply(getVersion())
  },
}
