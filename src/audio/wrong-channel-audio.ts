import { AudioPlayerStatus, VoiceConnection } from '@discordjs/voice'
import * as discordJsVoice from '@discordjs/voice'
import fs from 'fs'
import config from '../config'
import logger from '../logger'

const log = logger('wrong-channel-audio')

export async function playWrongChannelAudio(connection: VoiceConnection) {
  return await new Promise<void>((resolve, reject) => {
    const resource = discordJsVoice.createAudioResource(fs.createReadStream(config.wrongChannelAudioPath))
    const player = discordJsVoice.createAudioPlayer()
    connection.subscribe(player)
    player.play(resource)
    player.on(AudioPlayerStatus.Idle, () => {
      resolve()
    })
    player.on('error', (error) => {
      log.error('Audio player error:', error)
      reject(error)
    })
  })
}
