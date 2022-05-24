import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import { Guild, User } from 'discord.js'
import { recognizeSpeech } from './recognize-speech'
import logger from '../logger'

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
    resolve: resolveOuter as unknown as (result: T) => void,
    reject: rejectOuter as unknown as (reason?: any) => void,
  }
}

function * wrapperGenerator<T>(array: Array<Promise<T>>) {
  for (const promise of array) {
    yield promise.then((result) => ({ result, promise }))
  }
}

interface UserTranscription {
  user: User
  transcription: string
}

export async function * iterateRecognizedSpeech(connection: VoiceConnection, guild: Guild) {
  let deferred = defer<UserTranscription>()
  const buffer: Array<Promise<UserTranscription>> = [deferred.promise]

  connection.receiver.speaking.on(
    'start',
    (userId) => {
      // TODO#presenceChange: Check if exception is handled
      const user = guild.members.resolve(userId)?.user

      if (user === undefined) {
        deferred.reject(new Error(`Cannot resolve user with id "${userId}"`))
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

      const oldDeferred = deferred

      recognizeSpeech(listenStream)
        .then(transcription => ({ user, transcription }))
        .then(oldDeferred.resolve)
        .catch(oldDeferred.reject)

      deferred = defer<UserTranscription>()
      buffer.push(deferred.promise)
    },
  )

  while (true) {
    const { promise, result } = await Promise.race(wrapperGenerator(buffer))

    const indexOfPromise = buffer.indexOf(promise)
    buffer.splice(indexOfPromise, 1)

    yield result
  }
}
