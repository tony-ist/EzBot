import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import { helpCommand } from './help'
import { addactivityCommand } from './addactivity'
import { summonCommand } from './summon'
import { Command } from '../types'

type AllCommands = typeof pingCommand | typeof helpCommand | typeof addactivityCommand | typeof summonCommand
type AllCommandNames = AllCommands['name']

// TODO: Add /game command that displays your current game
export const commandList = [
  pingCommand,
  helpCommand,
  addactivityCommand,
  summonCommand,
]

export const commandStore = new Collection<AllCommandNames, Command<AllCommandNames>>()

commandList.forEach(command => commandStore.set(command.name, command))
