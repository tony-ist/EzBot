import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import {
  SummonOptions,
  summonToTheChannel,
} from '../actions/summon-to-the-channel'
import logger from '../logger'

const log = logger('commands/summon')

const COMMAND_NAME = 'summon'
export const summonCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands[COMMAND_NAME].description())
  },

  async execute(commandInteraction: CommandInteraction) {
    const guild = commandInteraction.guild
    const userId = commandInteraction.member?.user.id

    if (userId === undefined) {
      throw new Error('User id is undefined')
    }

    if (guild === undefined || guild === null) {
      throw new Error(`Guild is ${guild}`)
    }

    const voiceState = guild.voiceStates.cache.get(userId)
    const voiceChannel = voiceState?.channel
    const presences = guild.presences.cache
    const activity = presences?.get(userId)?.activities[0]

    if (activity === undefined) {
      await commandInteraction.reply(I18n.commands.summon.cannotSummon())
      log.debug('activity is undefined')
      return
    }

    const activityName = activity.name
    const botUserId = commandInteraction.client.user?.id

    if (voiceChannel === undefined || voiceChannel === null) {
      throw new Error(`voiceChannel is ${voiceChannel}`)
    }

    if (botUserId === undefined) {
      throw new Error(`botUserId is ${botUserId}`)
    }

    const options: SummonOptions = {
      alreadyInRightChannelCallback: async () => await commandInteraction.reply(I18n.commands.summon.inTheRightChannel()),
      botInVoiceChannelCallback: async () => await commandInteraction.reply(I18n.commands.summon.alreadyInChannel()),
      canSummonBotCallback: async () => await commandInteraction.reply(I18n.commands.summon.canSummon()),
    }

    await summonToTheChannel(voiceChannel, activityName, botUserId, options)
  },
}
