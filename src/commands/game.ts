import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import logger from '../logger'

const log = logger('commands/game')

export enum GameOptions {
  USER = 'user'
}

const COMMAND_NAME = 'game'
export const gameCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    const command = new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.game.description())

    command
      .addUserOption(option => option
        .setName(GameOptions.USER)
        .setDescription(I18n.commands.game.options.user()))

    return command
  },

  async execute(commandInteraction: CommandInteraction) {
    let user = commandInteraction.user
    const userOption = commandInteraction.options.get(GameOptions.USER)

    log.debug('User option:', userOption)

    if (userOption?.user !== undefined) {
      user = userOption.user
    }

    const presence = commandInteraction.guild?.presences.resolve(user.id)
    if (presence === undefined || presence === null) {
      throw new Error(`Presence is ${presence}`)
    }

    const activities = presence.activities
    if (activities.length === 0) {
      const userName = user.username
      await commandInteraction.reply(I18n.commands.game.notPlayingAnyGame({ userName }))
      log.debug(`Issuer "${userName}" is not playing any game or activity status is disabled`)
      return
    }

    const presenceName = activities[0].name
    await commandInteraction.reply(presenceName)
  },
}
