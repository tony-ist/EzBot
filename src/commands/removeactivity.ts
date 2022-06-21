import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import RemoveActivityPlugin from '../plugins/remove-activity-plugin'

const COMMAND_NAME = 'removeactivity'

export const removeactivityCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.removeactivity.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    await RemoveActivityPlugin.replyWithActivitySelectMenu(commandInteraction)
  },
}
