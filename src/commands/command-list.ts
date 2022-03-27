import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import { helpCommand } from './help'
import { Command } from '../types'
import { addActivityCommand } from './add-activity'

type AllCommands = typeof pingCommand | typeof helpCommand
type AllCommandNames = AllCommands['name']

export const commandList = [
  pingCommand,
  helpCommand,
  addActivityCommand,
]

export const commandStore = new Collection<AllCommandNames, Command<AllCommandNames>>()
// TODO: Review if incorrect to call forEach after exports
commandList.forEach(command => commandStore.set(command.name, command))
