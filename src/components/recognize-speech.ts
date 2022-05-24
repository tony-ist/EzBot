import Stream from 'stream'
import { google } from '@google-cloud/speech/build/protos/protos'
import AudioEncoding = google.cloud.speech.v1.RecognitionConfig.AudioEncoding
import config from '../config'
import googleSpeech from '@google-cloud/speech'
import logger from '../logger'
import prism from 'prism-media'
import { AudioReceiveStream } from '@discordjs/voice'

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

export async function recognizeSpeech(inputStream: AudioReceiveStream): Promise<string> {
  return await new Promise((resolve, reject) => {
    const request = {
      config: {
        encoding: AudioEncoding.LINEAR16,
        sampleRateHertz: 48000,
        languageCode: config.languageCode,
      },
      interimResults: false,
    }

    // this creates a 16-bit signed PCM, mono 48KHz PCM stream output
    const opusDecoder = new prism.opus.Decoder({
      frameSize: 960,
      channels: 1,
      rate: 48000,
    })

    inputStream
      .on('error', error => log.error('Input stream error:', error))
      .on('end', () => log.debug('Input stream end'))
      .on('close', () => log.debug('Input stream close'))

    // TODO: What happens if inputStream is very long?
    const recognizeStream: Stream.Duplex = googleSpeechClient.streamingRecognize(request)
      .on('error', error => log.error('Google speech recognition error:', error))
      .on('end', () => log.debug('Recognize stream end'))
      .on('close', () => log.debug('Recognize stream close'))

    // TODO: Error handler for pipe?
    inputStream
      .pipe(opusDecoder)
      .pipe(recognizeStream)
      .on('data', (recognitionData: RecognitionData) => {
        recognizeStream.emit('close')
        // console.log('inputStream.destroyed:', inputStream.destroyed)
        // console.log('inputStream.readable:', inputStream.readable)
        // console.log('recognizeStream.destroyed:', recognizeStream.destroyed)
        // console.log('recognizeStream.readable:', recognizeStream.readable)
        const firstTranscription = recognitionData.results[0].alternatives[0].transcript
        const result = firstTranscription.toLocaleLowerCase()
        resolve(result)
      })
      .on('error', reject)
  })
}
