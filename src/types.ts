import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export interface Command<N extends (string extends N ? never : string)> {
  name: N
  builder: SlashCommandBuilder
  execute: (commandInteraction: CommandInteraction) => Promise<any>
}
