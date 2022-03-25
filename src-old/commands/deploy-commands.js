const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
const { clientId, guildId, discordApiToken } = require('../../config.json')
const { commandList } = require('./command-list')

const rest = new REST({ version: '9' }).setToken(discordApiToken)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandList })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
