import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../types'
import { ActivityModel } from '../models/activity'
import { I18n } from '../i18n'
import { CommandInteraction } from 'discord.js'
import logger from '../logger'
import { tryExtractSingleDiscordEmoji } from '../utils/try-extract-single-discord-emoji'

const COMMAND_NAME = 'addactivity'
const log = logger('commands/addactivity')

export const addactivityCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    const command = new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.addactivity.description())

    command.addStringOption(option =>
      option.setName('activity')
        .setDescription(I18n.commands.addactivity.options.activity())
        .setRequired(true),
    )

    command.addStringOption(option =>
      option.setName('emoji')
        .setDescription(I18n.commands.addactivity.options.emoji())
        .setRequired(true),
    )

    return command
  },

  async execute(commandInteraction: CommandInteraction) {
    const activityNameOption = commandInteraction.options.get('activity')
    const activityName = typeof activityNameOption?.value === 'string' ? activityNameOption?.value.trim() : ''
    if (activityName === '') {
      await commandInteraction.reply(I18n.commands.addactivity.errors.propActivityNameIsRequired())
      return
    }

    const existingActivity = await ActivityModel.findOne({ name: activityName })

    if (existingActivity !== null) {
      await commandInteraction.reply(I18n.commands.addactivity.errors.activityWithThatNameExists({ activityName }))
      return
    }

    const emojiNameOption = commandInteraction.options.get('emoji')
    const emojiString = typeof emojiNameOption?.value === 'string' ? emojiNameOption?.value.trim() : ''
    log.debug(`Emoji string: "${emojiString}"`)
    const emoji = tryExtractSingleDiscordEmoji(emojiString)
    // TODO: Check that emoji exists on the server
    if (emoji === null) {
      await commandInteraction.reply(I18n.commands.addactivity.errors.propEmojiShouldBeValidEmoji())
      return
    }

    const guild = commandInteraction.guild
    if (guild == null) {
      throw new Error('No guild specified in interaction instance')
    }
    const roleName = activityName
    const roleReason = I18n.commands.addactivity.roleReason({ roleName })
    const role = await guild.roles.create({ name: roleName, reason: roleReason, mentionable: true })

    const newActivity = new ActivityModel({
      name: activityName,
      emoji: emoji,
      roleId: role.id,
    })
    await newActivity.save()
    log.debug('New activity created', newActivity.toJSON())

    await commandInteraction.reply(I18n.commands.addactivity.activityCreated({ activityName }))
  },
}
