import { Routes } from 'discord-api-types/v10'
import { REST } from '@discordjs/rest'
import { commandList } from '../src/commands/command-list'
import config from '../src/config'
import logger from '../src/logger'

const log = logger('scritps/register-commands')

export async function registerSlashCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.discordApiToken)

  log.info('Started refreshing application (/) commands.')

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commandList.map(command => command.builder.toJSON()) },
  )

  log.info('Successfully reloaded application (/) commands.')
}

// eslint-disable-next-line no-console
registerSlashCommands().catch(console.error)
