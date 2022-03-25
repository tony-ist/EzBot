import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export interface Command {
  builder: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<any>
}
