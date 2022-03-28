import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface Command<N extends (string extends N ? never : string)> {
  name: N
  build: () => SlashCommandBuilder
  execute: (commandInteraction: CommandInteraction) => Promise<any>
}
