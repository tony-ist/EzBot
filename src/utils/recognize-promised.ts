import Stream from 'stream'
import { google } from '@google-cloud/speech/build/protos/protos'
import AudioEncoding = google.cloud.speech.v1.RecognitionConfig.AudioEncoding
import config from '../config'
import googleSpeech from '@google-cloud/speech'
import logger from '../logger'

export interface RecognitionData {
  results: RecognitionResult[]
}

interface RecognitionResult {
  alternatives: RecognitionAlternative[]
}

interface RecognitionAlternative {
  transcript: string
}

const googleSpeechClient = new googleSpeech.SpeechClient()

const log = logger('recognize-promised')

export async function recognizeSpeech(inputStream: Stream.Readable): Promise<RecognitionData> {
  return await new Promise((resolve, reject) => {
    const request = {
      config: {
        encoding: AudioEncoding.LINEAR16,
        sampleRateHertz: 48000,
        languageCode: config.languageCode,
      },
      interimResults: false,
    }

    const recognizeStream: Stream.Duplex = googleSpeechClient.streamingRecognize(request)
      .on('error', error => log.error('Google speech recognition error:', error))
      .on('end', () => log.debug('Recognize stream end'))
      .on('close', () => log.debug('Recognize stream close'))

    inputStream.pipe(recognizeStream)
      .on('data', (data: RecognitionData) => {
        recognizeStream.emit('close')
        resolve(data)
      })
      .on('error', reject)
  })
}
