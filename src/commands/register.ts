import { Routes } from 'discord-api-types/v9'
import config from '../config'
import { commandList } from './command-list'
import { REST } from '@discordjs/rest'

export async function registerSlashCommands(): Promise<void> {
  // TODO: Use Discord API v10
  const rest = new REST({ version: '9' }).setToken(config.discordApiToken)

  console.log('Started refreshing application (/) commands.')

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commandList },
  )

  console.log('Successfully reloaded application (/) commands.')
}
