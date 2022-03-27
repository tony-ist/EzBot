import { Routes } from 'discord-api-types/v10'
import config from '../config'
import { commandList } from './command-list'
import { REST } from '@discordjs/rest'

export async function registerSlashCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.discordApiToken)

  // eslint-disable-next-line no-console
  console.log('Started refreshing application (/) commands.')

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commandList.map(command => command.builder.toJSON()) },
  )

  // eslint-disable-next-line no-console
  console.log('Successfully reloaded application (/) commands.')
}
