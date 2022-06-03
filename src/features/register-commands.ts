import { Routes } from 'discord-api-types/v10'
import { REST } from '@discordjs/rest'
import { commandList } from '../commands/command-list'
import config from '../config'
import logger from '../logger'

const log = logger('scripts/register-commands')

export async function registerSlashCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.discordApiToken)

  const body = commandList.map(command => command.build().toJSON())

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body },
  )

  log.info('Successfully reloaded application (/) commands.')
}
