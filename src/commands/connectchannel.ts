import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../types'
import { I18n } from '../i18n'
import { CommandInteraction } from 'discord.js'
import { ChannelType } from 'discord-api-types/v9'
import ConnectChannelPlugin from '../plugins/connect-channel-plugin'

const COMMAND_NAME = 'connectchannel'
export enum ConnectChannelOptions {
  CHANNEL = 'channel',
}

export const connectchannelCommand: Command<typeof COMMAND_NAME> = {
  name: COMMAND_NAME,

  build() {
    const command = new SlashCommandBuilder()
      .setName(COMMAND_NAME)
      .setDescription(I18n.commands.connectchannel.description())

    command.addChannelOption(option =>
      option.setName(ConnectChannelOptions.CHANNEL)
        .addChannelTypes([ChannelType.GuildVoice.valueOf()])
        .setDescription(I18n.commands.connectchannel.options.channel())
        .setRequired(true),
    )

    return command
  },

  async execute(commandInteraction: CommandInteraction) {
    await ConnectChannelPlugin.replyWithActivitiesSelectMenu(commandInteraction)
  },
}
