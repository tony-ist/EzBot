import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import { helpCommand } from './help'
import { Command } from '../types'

export const commandList = [
  pingCommand,
  helpCommand,
]
export const commandStore = new Collection<string, Command>()

// TODO: Review if incorrect to call forEach after exports
commandList.forEach(command => commandStore.set(command.builder.name, command))
