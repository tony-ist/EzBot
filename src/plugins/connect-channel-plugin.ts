import ListenerPlugin from './listener-plugin'
import Discord, {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js'
import { MessageButtonStyles } from 'discord.js/typings/enums'
import { ActivityModel } from '../models/activity'
import UserStateManager from '../state/user-state-manager'
import { I18n } from '../i18n'
import { ConnectChannelState } from '../models/user-state'

export const MULTISELECT_ID = 'connectchannel/activities'
export const SUBMIT_BUTTON_ID = 'connectchannel/submit'
export const CANCEL_BUTTON_ID = 'connectchannel/cancel'

export default class ConnectChannelPlugin implements ListenerPlugin {
  static async replyWithActivitiesSelectMenu(commandInteraction: CommandInteraction) {
    const activities = await ActivityModel.find()
    const activityOptions = activities.map(activity => ({
      label: activity.name,
      value: activity.name,
    }))

    const selectRow = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId(MULTISELECT_ID)
          .setPlaceholder(I18n.elements.select.placeholder())
          .setMinValues(1)
          .addOptions(activityOptions),
      )

    const channelOption = commandInteraction.options.get('channel')

    if (channelOption === null) {
      throw new Error('No "channel" option provided for command /connectchannel')
    }

    const userStateManager = new UserStateManager()
    await userStateManager.clear(commandInteraction.user.id)
    await userStateManager.setCommandOptions(commandInteraction.user.id, [channelOption.value])

    await commandInteraction.reply({
      content: I18n.commands.connectchannel.multiselect.selectActivities(),
      components: [selectRow],
    })
  }

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

    // TODO: Refactor this to use state instead, delete command options
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
          .setLabel(I18n.elements.buttons.submit())
          .setStyle(MessageButtonStyles.PRIMARY),
        new MessageButton()
          .setCustomId(CANCEL_BUTTON_ID)
          .setLabel(I18n.elements.buttons.cancel())
          .setStyle(MessageButtonStyles.SECONDARY),
      )

    await interaction.update({
      content: I18n.commands.connectchannel.buttons.header({ channelName, activityNames: activityNames.join(', ') }),
      components: [buttonRow],
    })
  }

  async onButtonClick(interaction: ButtonInteraction) {
    if (interaction.customId === SUBMIT_BUTTON_ID) {
      const userStateManager = new UserStateManager()
      const connectChannelState = await userStateManager.getState(interaction.user.id) as ConnectChannelState

      for (const activityName of connectChannelState.activityNames) {
        const channelId = await userStateManager.getCommandOption(interaction.user.id, 0)
        await ActivityModel.findOneAndUpdate({ name: activityName }, { channelId })
      }

      await interaction.update({
        content: I18n.commands.connectchannel.result.success({
          channelName: connectChannelState.channelName,
          activityNames: connectChannelState.activityNames.join(', '),
        }),
        components: [],
      })
    } else if (interaction.customId === CANCEL_BUTTON_ID) {
      await interaction.update({ content: I18n.commands.connectchannel.result.cancelled(), components: [] })
    }
  }
}
