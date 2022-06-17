import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import AddGamesPlugin from '../plugins/add-games-plugin'

const COMMAND_NAME = 'addgames'

export enum ADD_GAMES_OPTIONS {
  GAME_NAME = 'gamename'
}

export const addgamesCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    const command = new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.addgames.description())

    command.addStringOption(option =>
      option
        .setName(ADD_GAMES_OPTIONS.GAME_NAME)
        .setDescription(I18n.commands.addgames.options.gameName())
        .setRequired(true),
    )

    return command
  },

  async execute(commandInteraction: CommandInteraction) {
    await AddGamesPlugin.replyWithActivitySelectMenu(commandInteraction)
  },
}
