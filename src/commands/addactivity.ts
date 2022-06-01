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
        .setDescription('New Activity name')
        .setRequired(true),
    )

    command.addStringOption(option =>
      option.setName('emoji')
        .setDescription('Dashboard emoji')
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

    const emojiNameOption = commandInteraction.options.get('emoji')
    const emojiString = typeof emojiNameOption?.value === 'string' ? emojiNameOption?.value.trim() : ''
    const emoji = tryExtractSingleDiscordEmoji(emojiString)
    // TODO: Check that emoji exist on the server
    log.debug(`Emoji option value: ${emojiString}`)
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
    const role = await guild.roles.create({ name: roleName, reason: roleReason })

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
