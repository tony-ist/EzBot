const i18n = require('i18n')

function addCommands(discordClient, db) {
  discordClient.addCommand('listGamesAndChannels', async message => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const cursor = await db.collection('GamesAndChannels').find()
    let reply = '\n'

    while (await cursor.hasNext()) {
      const next = await cursor.next()
      reply += `${i18n.__mf('ListGameAndChannelsLine', { game: next.game, channel: next.channel })}\n`
    }

    await message.reply(reply)
  }, i18n.__('ListGamesAndChannelsHelp'))

  discordClient.addCommand('addGameAndChannel', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: args[0] })

    if (gameAndChannel) {
      await message.reply(i18n.__mf('AddGameAndChannelAlreadyExist', { game: gameAndChannel.game, channel: gameAndChannel.channel }))
      return
    }

    await db.collection('GamesAndChannels').insertOne({
      game: args[0],
      channel: args[1]
    })

    await message.reply(i18n.__mf('AddGameAndChannelAdded', { game: args[0], channel: args[1] }))
  }, i18n.__('AddGameAndChannelHelp'))

  discordClient.addCommand('deleteGameAndChannel', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: args[0] })

    if (!gameAndChannel) {
      await message.reply(i18n.__mf('DeleteGameAndChannelNotExist', { game: args[0] }))
      return
    }

    await db.collection('GamesAndChannels').deleteOne({ game: args[0] })

    await message.reply(i18n.__mf('DeleteGameAndChannelDeleted', { game: gameAndChannel.game, channel: gameAndChannel.channel }))
  }, i18n.__('DeleteGameAndChannelHelp'))

  discordClient.addCommand('listEmotesAndRoles', async message => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const cursor = await db.collection('EmotesAndRoles').find()
    let reply = '\n'

    while (await cursor.hasNext()) {
      const next = await cursor.next()
      reply += `${i18n.__mf('ListEmotesAndRolesLine', { emote: next.emote, role: next.role })}\n`
    }

    await message.reply(reply)
  }, i18n.__('ListEmotesAndRolesHelp'))

  discordClient.addCommand('addEmoteAndRole', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const emoteAndRole = await db.collection('EmotesAndRoles').findOne({ emote: args[0] })

    if (emoteAndRole) {
      await message.reply(i18n.__mf('AddEmoteAndRoleAlreadyExist', { emote: emoteAndRole.emote, role: emoteAndRole.role }))
      return
    }

    await db.collection('EmotesAndRoles').insertOne({
      emote: args[0],
      role: args[1]
    })

    await message.reply(i18n.__mf('AddEmoteAndRoleAdded', { emote: args[0], role: args[1] }))
  }, i18n.__('AddEmoteAndRoleHelp'))

  discordClient.addCommand('deleteEmoteAndRole', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const emoteAndRole = await db.collection('EmotesAndRoles').findOne({ emote: args[0] })

    if (!emoteAndRole) {
      await message.reply(i18n.__mf('DeleteEmoteAndRoleNotExist', { emote: args[0] }))
      return
    }

    await db.collection('EmotesAndRoles').deleteOne({ emote: args[0] })

    await message.reply(i18n.__mf('DeleteEmoteAndRoleDeleted', { emote: emoteAndRole.emote, role: emoteAndRole.role }))
  }, i18n.__('DeleteEmoteAndRoleHelp'))
}

module.exports = { addCommands }
