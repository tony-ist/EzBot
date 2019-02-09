function addCommands(discordClient, db) {
  discordClient.addCommand('listGamesAndChannels', async message => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const cursor = await db.collection('GamesAndChannels').find()
    let reply = '\n'

    while (await cursor.hasNext()) {
      const next = await cursor.next()
      reply += `Игра: ${next.game}, Канал: ${next.channel}\n`
    }

    await message.reply(reply)
  }, 'Отображает список связок между играми и голосовыми каналами.')

  discordClient.addCommand('addGameAndChannel', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: args[0] })

    if (gameAndChannel) {
      await message.reply(`Игра ${gameAndChannel.game} уже соответствует каналу ${gameAndChannel.channel}`)
      return
    }

    await db.collection('GamesAndChannels').insertOne({
      game: args[0],
      channel: args[1]
    })

    await message.reply(`Добавлена игра ${args[0]} в соответствии каналу ${args[1]}`)
  }, 'Аргумент 1 - название игры, аргумент 2 - id голосового канала. Добавляет связку между игрой и каналом.')

  discordClient.addCommand('deleteGameAndChannel', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: args[0] })

    if (!gameAndChannel) {
      await message.reply(`Игра ${args[0]} не соответствует ни одному каналу`)
      return
    }

    await db.collection('GamesAndChannels').deleteOne({ game: args[0] })

    await message.reply(`Удалено соответствие игры ${gameAndChannel.game} каналу ${gameAndChannel.channel}`)
  }, 'Аргумент - название игры. Удаляет связку между данной игрой и голосовым каналом.')

  discordClient.addCommand('listEmotesAndRoles', async message => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const cursor = await db.collection('EmotesAndRoles').find()
    let reply = '\n'

    while (await cursor.hasNext()) {
      const next = await cursor.next()
      reply += `Эмоция: ${next.emote}, Роль: ${next.role}\n`
    }

    await message.reply(reply)
  }, 'Отображает список связок между эмоциями и ролями.')

  discordClient.addCommand('addEmoteAndRole', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const emoteAndRole = await db.collection('EmotesAndRoles').findOne({ emote: args[0] })

    if (emoteAndRole) {
      await message.reply(`Эмоция ${emoteAndRole.emote} уже соответствует роли ${emoteAndRole.role}`)
      return
    }

    await db.collection('EmotesAndRoles').insertOne({
      emote: args[0],
      role: args[1]
    })

    await message.reply(`Добавлена эмоция ${args[0]} в соответствии роли ${args[1]}`)
  }, 'Аргумент 1 - название эмоции, аргумент 2 - название роли. Добавляет связку между эмоцией и ролью.')

  discordClient.addCommand('deleteEmoteAndRole', async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return
    }

    const emoteAndRole = await db.collection('EmotesAndRoles').findOne({ emote: args[0] })

    if (!emoteAndRole) {
      await message.reply(`Эмоция ${args[0]} не соответствует ни одной роли`)
      return
    }

    await db.collection('EmotesAndRoles').deleteOne({ emote: args[0] })

    await message.reply(`Удалено соответствие эмоции ${emoteAndRole.emote} роли ${emoteAndRole.role}`)
  }, 'Аргумент - название эмоции. Удаляет связку между данной эмоцией и ролью.')
}

module.exports = { addCommands }
