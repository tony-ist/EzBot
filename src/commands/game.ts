import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import logger from '../logger'

const log = logger('commands/game')

const COMMAND_NAME = 'game'
export const gameCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.game.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    const userId = commandInteraction.user.id
    const presence = commandInteraction.guild?.presences.cache.get(userId)
    if (presence === undefined) {
      throw new Error('Presence is undefined')
    }

    const activities = presence.activities
    if (activities.length === 0) {
      await commandInteraction.reply(I18n.commands.game.notPlayingAnyGame())
      const userName = commandInteraction.user.username
      log.debug(`Issuer "${userName}" is not playing any game or activity status is disabled`)
      return
    }

    const presenceName = activities[0].name
    await commandInteraction.reply(presenceName)
  },
}
