import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import { Command } from '../types'

export const commandList = [pingCommand]
export const commandStore = new Collection<string, Command>()

commandList.forEach(command => commandStore.set(command.builder.name, command))
