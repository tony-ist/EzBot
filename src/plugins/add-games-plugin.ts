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
import { AddGamesOptions } from '../commands/addgames'
import { AddGamesState } from '../models/user-state'

const SELECT_ID = 'addgames/select'
const SUBMIT_BUTTON_ID = 'addgames/submit'
const CANCEL_BUTTON_ID = 'addgames/cancel'

const log = logger('plugins/add-games')

export default class AddGamesPlugin implements ListenerPlugin {
  static async replyWithActivitySelectMenu(commandInteraction: CommandInteraction) {
    const activities = await ActivityModel.find()
    const activityOptions = activities.map(activity => ({
      label: activity.name,
      value: activity.name,
    }))

    const selectRow = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId(SELECT_ID)
          .setPlaceholder(I18n.elements.select.placeholder())
          .addOptions(activityOptions),
      )

    const gameNameOption = commandInteraction.options.get(AddGamesOptions.GAME_NAME)

    log.debug('Game name option:', gameNameOption)

    if (gameNameOption === null) {
      throw new Error('No "gameName" option provided for command /addgames')
    }

    if (typeof gameNameOption.value !== 'string') {
      throw new Error(`gameNameOption type is not string, it is: ${typeof gameNameOption.value}`)
    }

    const userStateManager = new UserStateManager()
    await userStateManager.clear(commandInteraction.user.id)
    await userStateManager.updateState(commandInteraction.user.id, { gameName: gameNameOption.value })

    await commandInteraction.reply({
      content: I18n.commands.addgames.select.selectActivity(),
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

    const userStateManager = new UserStateManager()
    const addGamesState = await userStateManager.getState(interaction.user.id) as AddGamesState

    log.debug('onSelectMenu user state:', addGamesState)

    const gameName = addGamesState.gameName

    if (gameName === undefined) {
      throw new Error('gameName is undefined')
    }

    const activityName = interaction.values[0]
    await userStateManager.updateState(interaction.user.id, { activityName })

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
      content: I18n.commands.addgames.buttons.header({ gameName, activityName }),
      components: [buttonRow],
    })
  }

  async onButtonClick(interaction: ButtonInteraction) {
    if (interaction.customId === SUBMIT_BUTTON_ID) {
      const userStateManager = new UserStateManager()
      const addGamesState = await userStateManager.getState(interaction.user.id) as AddGamesState
      const activityName = addGamesState.activityName
      const gameName = addGamesState.gameName

      log.debug('onButtonClick user state:', addGamesState)

      await ActivityModel.findOneAndUpdate({ name: activityName }, { $addToSet: { presenceNames: gameName } })

      if (activityName === undefined) {
        throw new Error('activityName is undefined')
      }

      if (gameName === undefined) {
        throw new Error('gameName is undefined')
      }

      await interaction.update({
        content: I18n.commands.addgames.result.success({
          activityName,
          gameName,
        }),
        components: [],
      })
    } else if (interaction.customId === CANCEL_BUTTON_ID) {
      await interaction.update({ content: I18n.commands.addgames.result.cancelled(), components: [] })
    }
  }
}
