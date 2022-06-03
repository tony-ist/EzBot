import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import { helpCommand } from './help'
import { addactivityCommand } from './addactivity'
import { summonCommand } from './summon'
import { Command } from '../types'
import { gameCommand } from './game'
import { connectchannelCommand } from './connectchannel'
import { showactivitiesCommand } from './showactivities'

type AllCommands = typeof pingCommand
  | typeof helpCommand
  | typeof addactivityCommand
  | typeof summonCommand
  | typeof gameCommand
  | typeof showactivitiesCommand
  | typeof connectchannelCommand
type AllCommandNames = AllCommands['name']

export const commandList = [
  pingCommand,
  helpCommand,
  addactivityCommand,
  summonCommand,
  gameCommand,
  connectchannelCommand,
  showactivitiesCommand,
]

export const commandStore = new Collection<AllCommandNames, Command<AllCommandNames>>()

commandList.forEach(command => commandStore.set(command.name, command))
