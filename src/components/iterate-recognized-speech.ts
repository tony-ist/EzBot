import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import { Guild } from 'discord.js'
import { recognizeSpeech } from './recognize-speech'
import logger from '../logger'
import { UserTranscription } from '../types'

const log = logger('components/iterate-recognized-speech')

function defer<T>() {
  let resolveOuter
  let rejectOuter
  const promise = new Promise<T>((resolve, reject) => {
    resolveOuter = resolve
    rejectOuter = reject
  })

  return {
    promise,
    resolve: resolveOuter as unknown as (result?: T) => void,
    reject: rejectOuter as unknown as (reason?: any) => void,
  }
}

export async function * iterateRecognizedSpeech(connection: VoiceConnection, guild: Guild) {
  let waitForBufferUpdate = defer()
  let buffer: UserTranscription[] = []

  connection.receiver.speaking.on(
    'start',
    (userId) => {
      // TODO#presenceChange: Check if exception is handled
      const user = guild.members.resolve(userId)?.user

      if (user === undefined) {
        waitForBufferUpdate.reject(new Error(`Cannot resolve user with id "${userId}"`))
        return
      }

      const userName = user.username ?? 'Unknown user'
      log.debug(`User "${userName}" started speaking...`)

      if (connection.receiver.subscriptions.get(userId) !== undefined) {
        return // TODO: Comment
      }

      const listenStream = connection.receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.AfterSilence,
          duration: 1000,
        },
      })

      recognizeSpeech(listenStream)
        .then(transcription => ({ user, transcription }))
        .then((result) => {
          buffer.push(result)
          waitForBufferUpdate.resolve()
          waitForBufferUpdate = defer()
        })
        .catch(waitForBufferUpdate.reject)
    },
  )

  while (true) {
    await waitForBufferUpdate.promise

    yield * buffer

    buffer = []
  }
}
