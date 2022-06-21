import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../types'
import { ActivityModel } from '../models/activity'
import { I18n } from '../i18n'
import { CommandInteraction } from 'discord.js'
import logger from '../logger'
import { isValidEmoji } from '../validators/emoji-validator'

const COMMAND_NAME = 'addactivity'
const log = logger('commands/addactivity')
export enum AddActivityOptions {
  ACTIVITY = 'activity',
  EMOJI = 'emoji',
}

export const addactivityCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    const command = new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.addactivity.description())

    command.addStringOption(option =>
      option.setName(AddActivityOptions.ACTIVITY)
        .setDescription(I18n.commands.addactivity.options.activity())
        .setRequired(true),
    )

    command.addStringOption(option =>
      option.setName(AddActivityOptions.EMOJI)
        .setDescription(I18n.commands.addactivity.options.emoji())
        .setRequired(true),
    )

    return command
  },

  async execute(commandInteraction: CommandInteraction) {
    const activityNameOption = commandInteraction.options.get(AddActivityOptions.ACTIVITY)
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

    const emojiNameOption = commandInteraction.options.get(AddActivityOptions.EMOJI)

    // This should throw because emoji field is required
    if (emojiNameOption === null) {
      throw new Error('emojiNameOption is null')
    }

    const optionValue = emojiNameOption.value as string
    const emoji = optionValue.trim()
    log.debug(`Emoji: "${emoji}"`)

    if (!isValidEmoji(emoji)) {
      await commandInteraction.reply(I18n.commands.addactivity.errors.propEmojiShouldBeValidEmoji())
      return
    }

    const guild = commandInteraction.guild
    if (guild == null) {
      throw new Error('commandInteraction.guild is null')
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
