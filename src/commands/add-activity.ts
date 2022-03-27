import { SlashCommandBuilder } from '@discordjs/builders'
import i18n from '../i18n/i18n-init'
import { Command } from '../types'
import { ActivityModel } from '../models/activity'

const commandName = 'addactivity'

export const addActivityCommand: Command = {
  builder: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(i18n.__('Add new activity')),

  async execute(interaction) {
    const qwer = new ActivityModel({
      name: 'qwer',
      emojiName: 'asdf',
      roleId: 'zxcv',
    })

    await qwer.save()

    const activity = await ActivityModel.findOne()

    console.log(activity)

    await interaction.reply('addActivity')
  },
}
