require('dotenv').config()
const Discord = require('discord.js')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const yandexSpeech = require('yandex-speech')
const config = require('./config')
const convertTo1Channel = require('./convertTo1Channel')
const parseString = require('xml2js').parseString

const argsRegexp = /[^\s"]+|"([^"]*)"/gi
const discordClient = new Discord.Client()
const yesWords = ['да', 'хорошо', 'давай', 'ок', 'окей', 'подтверждаю', 'согласен', 'хочу']
const noWords = [ 'не_надо', 'не подтверждаю', 'не_согласен', 'не_хочу', 'неверно', 'нет' ]
const mongoConnectionUrl = `mongodb://${config.dbUser}:${config.dbPassword}@localhost:27017/admin`
const dbName = 'ezbot'

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.Commands = {}

discordClient.addCommand = (name, callback, description) => {
  discordClient.Commands[name] = { name, callback, description }
}

discordClient.addCommand('ping', msg => {
  msg.reply('Pong!')
})

discordClient.addCommand('game', msg => {
  msg.reply(msg.author.presence.game.name)
})

const GameChannels = {
  'Visual Studio Code': '508227060938964992',
  'Mines': '508227060938964992'
}

MongoClient.connect(mongoConnectionUrl, { useNewUrlParser: true }, (err, mongoClient) => {
  if (err) {
    console.error(err)
    return
  }

  console.log('Connected successfully to mongodb server')

  // eslint-disable-next-line
  const db = mongoClient.db(dbName)

  // db.collection('test').insertOne({ testData: 'testData', qwe: 123 })

  discordClient.on('presenceUpdate', (oldMember, newMember) => {
    const presence = newMember.presence
    const userVoiceChannel = newMember.voiceChannel

    if (!presence || !presence.game || !userVoiceChannel) {
      return
    }

    const channelId = GameChannels[presence.game.name]

    if (!channelId || channelId === userVoiceChannel.id) {
      return
    }

    userVoiceChannel.join()
      .then(connection => {
        console.log('Joined voice channel')

        const playFilePath = 'samples/temp.mp3'

        yandexSpeech.TTS({
          developer_key: config.yandexApiKey,
          text: `Ей, ребята, вы седите не в том конале, хотите я вас перекину??`,
          // text: `Ей, ${newMember.user.username}`,
          file: playFilePath
        }, () => {
          const dispatcher = connection.playFile(playFilePath)
          dispatcher.on('end', () => {
            console.log(dispatcher.time)
            const receiver = connection.createReceiver()
            connection.on('speaking', (user, speaking) => {
              if (speaking) {
                console.log(`I'm listening to ${user}`)
                const tempOutPath = 'samples/tempOut.pcm'
                // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
                const audioStream = receiver.createPCMStream(user)
                const outputStream = fs.createWriteStream(tempOutPath)
                audioStream.pipe(outputStream)
                outputStream.on('data', console.log)
                audioStream.on('end', () => {
                  console.log('audioStream end')
                  convertTo1Channel(tempOutPath)
                  yandexSpeech.ASR({
                    developer_key: config.yandexApiKey,
                    file: 'samples/tempOut.pcm',
                    topic: 'buying',
                    lang: 'ru-RU',
                    filetype: 'audio/x-pcm;bit=16;rate=48000'
                  }, (err, httpResponse, xml) => {
                    if (err) {
                      userVoiceChannel.leave()
                      console.log(err)
                      return
                    }

                    if (httpResponse.statusCode !== 200) {
                      userVoiceChannel.leave()
                      return
                    }

                    parseString(xml, (err, result) => {
                      if (err) {
                        console.log(err)
                        userVoiceChannel.leave()
                        return
                      }

                      if (result.recognitionResults['$'].success !== '1') {
                        return
                      }

                      const variants = result.recognitionResults.variant

                      variants.forEach(val => {
                        const word = val['_']
                        if (yesWords.indexOf(word) > -1) {
                          console.log(`Moving member ${newMember} to channel ${channelId}`)
                          connection.channel.members.array().forEach(val => {
                            if (val.user.id !== discordClient.user.id) {
                              val.setVoiceChannel(channelId)
                            }
                            userVoiceChannel.leave()
                          })
                          // newMember.setVoiceChannel(channelId)
                        } else if (noWords.indexOf(word) > -1) {
                          console.log(`Moving member ${newMember} to channel ${channelId}`)
                          userVoiceChannel.leave()
                        }
                      })
                    })
                  })
                })
              }
            })
          })
          dispatcher.on('debug', i => {
            console.log(i)
          })
          dispatcher.on('start', () => {
            console.log('playing')
          })
          dispatcher.once('error', errWithFile => {
            console.log('err with file: ' + errWithFile)
            return ('err with file: ' + errWithFile)
          })
          dispatcher.on('error', e => {
            console.log(e)
          })
          dispatcher.setVolume(1)
          console.log('done')
        })
      }).catch(console.error)
  })
})

discordClient.on('message', msg => {
  if (msg.content.indexOf('!') !== 0) {
    return
  }

  const content = msg.content.split(' ')
  const commandName = content.shift().substring(1)

  console.log(commandName)

  if (!(commandName in discordClient.Commands)) {
    return
  }

  const command = discordClient.Commands[commandName]
  const argsStr = content.join(' ')
  const args = []
  let match = null

  do {
    match = argsRegexp.exec(argsStr)
    if (match != null) {
      args.push(match[1] ? match[1] : match[0])
    }
  } while (match != null)

  command.callback(msg, args)
})

discordClient.login(config.apiToken)
