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
import logger from '../logger'
import { RemoveActivityState } from '../models/user-state'

const SELECT_ID = 'removeactivity/select'
const SUBMIT_BUTTON_ID = 'removeactivity/submit'
const CANCEL_BUTTON_ID = 'removeactivity/cancel'

const log = logger('plugins/remove-activity')

export default class RemoveActivityPlugin implements ListenerPlugin {
  static async replyWithActivitySelectMenu(commandInteraction: CommandInteraction) {
    // console.log(4, commandInteraction.guild?.emojis.resolve('988477226674688011'))
    // commandInteraction.guild?.emojis.resolve('988473065841233970')?.delete('deleted in debug mode')

    const activities = await ActivityModel.find()
    const activityOptions = activities.map(activity => ({
      label: activity.name,
      value: activity.id,
    }))

    const selectRow = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId(SELECT_ID)
          .setPlaceholder(I18n.elements.select.placeholder())
          .addOptions(activityOptions),
      )

    const userStateManager = new UserStateManager()
    await userStateManager.clear(commandInteraction.user.id)

    await commandInteraction.reply({
      content: I18n.commands.removeactivity.select.selectActivity(),
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
    if (interaction.customId !== SELECT_ID) {
      log.debug('Skipping select menu interaction with customId:', interaction.customId)
      return
    }

    if (interaction.guild === null) {
      throw new Error('interaction.guild is null')
    }

    log.debug('Interaction values:', interaction.values)

    const activityId = interaction.values[0]
    const userStateManager = new UserStateManager()
    await userStateManager.updateState(interaction.user.id, { activityId })

    const activity = await ActivityModel.findById(activityId)

    if (activity === null) {
      throw new Error(`Activity with id ${activityId} was not found.`)
    }

    const { name: activityName, roleId, channelId, emoji } = activity

    const role = await interaction.guild.roles.fetch(roleId)

    const roleName = role === null ? I18n.notFound() : role.name
    let channelName = I18n.notFound() as string

    if (channelId !== null && channelId !== undefined) {
      const channel = await interaction.guild.channels.fetch(channelId)

      if (channel !== null) {
        channelName = channel.name
      }
    }

    await userStateManager.updateState(interaction.user.id, { activityId, activityName, channelName, roleName, emoji })

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
      content: I18n.commands.removeactivity.buttons.header({
        activityName,
        roleName,
        channelName,
        emoji,
      }),
      components: [buttonRow],
    })
  }

  async onButtonClick(interaction: ButtonInteraction) {
    if (interaction.customId === SUBMIT_BUTTON_ID) {
      const userStateManager = new UserStateManager()
      const removeActivityState = await userStateManager.getState(interaction.user.id) as RemoveActivityState
      const { activityId, activityName, roleName, channelName, emoji } = removeActivityState

      if (activityName === undefined) {
        throw new Error('activityName is undefined')
      }

      if (roleName === undefined) {
        throw new Error('roleName is undefined')
      }

      if (channelName === undefined) {
        throw new Error('channelName is undefined')
      }

      if (emoji === undefined) {
        throw new Error('emoji is undefined')
      }

      log.debug('User state:', removeActivityState)

      const activity = await ActivityModel.findById(activityId)

      if (activity === null) {
        throw new Error(`Activity with id ${activityId} was not found.`)
      }

      const { roleId, channelId } = activity

      const guild = interaction.guild

      if (guild === null) {
        throw new Error('Guild is null')
      }

      const role = await guild.roles.fetch(roleId)

      if (role !== null) {
        await role.delete('Deleted by EzBot')
      }

      if (channelId !== undefined) {
        const channel = await guild.channels.fetch(channelId)

        if (channel !== null) {
          await channel.delete('Deleted by EzBot')
        }
      }

      log.debug(`Emoji: "${emoji}"`)
      try {
        // Emoji is either common emoji or guild emoji id.
        // Fetch will return guild emoji if emoji is valid guild emoji id.
        // Otherwise it will throw an error.
        const guildEmoji = await guild.emojis.fetch(emoji)

        log.debug(`Guild emoji: "${guildEmoji}"`)

        if (guildEmoji !== null) {
          await guildEmoji.delete('Deleted by EzBot')
        }
      } catch {
        log.debug(`No emoji "${emoji}" found in guild.`)
      }

      await activity.remove()

      await interaction.update({
        content: I18n.commands.removeactivity.result.success({
          activityName,
          roleName,
          channelName,
          emoji,
        }),
        components: [],
      })
    } else if (interaction.customId === CANCEL_BUTTON_ID) {
      await interaction.update({ content: I18n.commands.removeactivity.result.cancelled(), components: [] })
    }
  }
}
