import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import { statsFormatter } from '../features/formatters/stats-formatter'

const COMMAND_NAME = 'stats'

export const statsCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.stats.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    const guild = commandInteraction.guild

    if (guild === null) {
      throw new Error('commandInteraction.guild is null')
    }

    const message = await statsFormatter(guild)
    await commandInteraction.reply(message)
  },
}
