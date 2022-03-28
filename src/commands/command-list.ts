import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import { helpCommand } from './help'
import { addactivityCommand } from './addactivity'
import { Command } from '../types'

type AllCommands = typeof pingCommand | typeof helpCommand | typeof addactivityCommand
type AllCommandNames = AllCommands['name']

export const commandList = [
  pingCommand,
  helpCommand,
  addactivityCommand,
]

export const commandStore = new Collection<AllCommandNames, Command<AllCommandNames>>()
// TODO: Review if incorrect to call forEach after exports
commandList.forEach(command => commandStore.set(command.name, command))
