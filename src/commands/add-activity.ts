import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../types'
import { ActivityModel } from '../models/activity'
import { I18n } from '../i18n'
import { CommandInteraction } from 'discord.js'
import logger from '../logger'

const COMMAND_NAME = 'addactivity'
const log = logger('commands/add-activity')

export const addActivityCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  builder: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(I18n.commands.addactivity.description()),

  async execute(commandInteraction: CommandInteraction) {
    const qwer = new ActivityModel({
      name: 'qwer',
      emojiName: 'asdf',
      roleId: 'zxcv',
    })

    await qwer.save()

    const activity = await ActivityModel.findOne()

    log.debug(JSON.stringify(activity, null, 2))

    await commandInteraction.reply('addActivity')
  },
}
