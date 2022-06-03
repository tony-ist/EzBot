import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../types'
import { I18n } from '../i18n'
import { CommandInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js'
import { ChannelType } from 'discord-api-types/v9'
import { ActivityModel } from '../models/activity'
import UserStateManager from '../state/user-state-manager'

const COMMAND_NAME = 'connectchannel'

export const MULTISELECT_ID = 'connectchannel/activities'

export const connectchannelCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    const command = new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.connectchannel.description())

    command.addChannelOption(option =>
      option.setName('channel')
        .addChannelTypes([ChannelType.GuildVoice.valueOf()])
        .setDescription('Voice channel to connect')
        .setRequired(true),
    )

    return command
  },

  async execute(commandInteraction: CommandInteraction) {
    const activities = await ActivityModel.find()
    const activityOptions = activities.map(activity => ({
      label: activity.name,
      value: activity.name,
    }))

    const selectRow = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId(MULTISELECT_ID)
          .setPlaceholder('Nothing selected')
          .setMinValues(1)
          .addOptions(activityOptions),
      )

    const channelOption = commandInteraction.options.get('channel')

    if (channelOption === null) {
      throw new Error('No "channel" option for command /connectchannel')
    }

    const userStateManager = new UserStateManager()
    await userStateManager.setCommandOptions(commandInteraction.user.id, [channelOption.value])

    await commandInteraction.reply({ content: 'Select activities...', components: [selectRow] })
  },
}
