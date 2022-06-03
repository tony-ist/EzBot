import ListenerPlugin from './listener-plugin'
import Discord, { ButtonInteraction, MessageActionRow, MessageButton, SelectMenuInteraction } from 'discord.js'
import { MULTISELECT_ID } from '../commands/connectchannel'
import { MessageButtonStyles } from 'discord.js/typings/enums'
import { ConnectChannelState } from '../models/user-state'
import { ActivityModel } from '../models/activity'
import UserStateManager from '../state/user-state-manager'

export const SUBMIT_BUTTON_ID = 'connectchannel/submit'
export const CANCEL_BUTTON_ID = 'connectchannel/cancel'

export default class ConnectChannelPlugin implements ListenerPlugin {
  async onInteractionCreate(interaction: Discord.Interaction) {
    if (interaction.isSelectMenu()) {
      return await this.onSelectMenu(interaction)
    }

    if (interaction.isButton()) {
      return await this.onButtonClick(interaction)
    }
  }

  async onSelectMenu(interaction: SelectMenuInteraction) {
    if (interaction.customId !== MULTISELECT_ID) {
      return
    }

    if (interaction.guild === null) {
      throw new Error('interaction.guild is null')
    }

    const userStateManager = new UserStateManager()

    const channelId = await userStateManager.getCommandOption(interaction.user.id, 0)

    if (typeof channelId !== 'string') {
      throw new Error(`channelId is of type ${typeof channelId} but expected string`)
    }

    const channel = interaction.guild.channels.resolve(channelId)

    if (channel === null) {
      throw new Error(`There is no channel with id ${channelId}`)
    }

    const activityNames = interaction.values
    const channelName = channel.name
    await userStateManager.updateState(interaction.user.id, { channelName, activityNames })

    const buttonRow = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(SUBMIT_BUTTON_ID)
          .setLabel('Yay')
          .setStyle(MessageButtonStyles.PRIMARY),
        new MessageButton()
          .setCustomId(CANCEL_BUTTON_ID)
          .setLabel('Nay')
          .setStyle(MessageButtonStyles.SECONDARY),
      )

    await interaction.update({
      content: `Channel "${channelName}" will be connected to these activities: "${activityNames.join(', ')}". Are you sure?`,
      components: [buttonRow],
    })
  }

  async onButtonClick(interaction: ButtonInteraction) {
    if (interaction.customId === SUBMIT_BUTTON_ID) {
      const userStateManager = new UserStateManager()
      const connectChannelState: ConnectChannelState = await userStateManager.getState(interaction.user.id)

      for (const activityName of connectChannelState.activityNames) {
        const channelId = await userStateManager.getCommandOption(interaction.user.id, 0)
        await ActivityModel.findOneAndUpdate({ name: activityName }, { channelId })
      }

      await interaction.update({
        content: `Channel "${connectChannelState.channelName}" was connected to these activities: "${connectChannelState.activityNames.join(', ')}".`,
        components: [],
      })
    } else if (interaction.customId === CANCEL_BUTTON_ID) {
      await interaction.update({ content: 'Cancelled', components: [] })
    }
  }
}