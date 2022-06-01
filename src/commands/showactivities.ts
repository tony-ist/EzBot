import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../i18n'
import { Command } from '../types'
import { Activity, ActivityModel } from '../models/activity'

const COMMAND_NAME = 'showactivities'
export const showactivitiesCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    return new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.showactivities.description())
  },

  async execute(commandInteraction: CommandInteraction) {
    let message = ''
    const activities: Activity[] = await ActivityModel.find()
    for (const activity of activities) {
      const guild = commandInteraction.guild
      const roleName = guild?.roles.resolve(activity.roleId)?.name
      const channelName = activity.channelId === undefined ? undefined : guild?.channels.resolve(activity.channelId)?.name
      const presenceNames = activity.presenceNames.join(', ')
      const formattedActivity = I18n.commands.showactivities.formatActivity({
        activityName: activity.name,
        emoji: activity.emoji,
        roleName: roleName ?? '',
        roleId: activity.roleId,
        channelName: channelName ?? '',
        channelId: activity.channelId ?? '',
        presenceNames: presenceNames,
      })

      message += `${formattedActivity}`
    }

    await commandInteraction.reply(message)
  },
}
