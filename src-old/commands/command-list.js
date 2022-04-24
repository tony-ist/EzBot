const ping = require('./ping')
const { Collection } = require('discord.js')

const commandList = [ping]
const commandStore = new Collection()

commandList.forEach(command => commandStore.set(command.data.name, command))

module.exports = {
  commandList,
  commandStore,
}
