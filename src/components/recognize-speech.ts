import Stream from 'stream'
import { google } from '@google-cloud/speech/build/protos/protos'
import config from '../config'
import googleSpeech from '@google-cloud/speech'
import logger from '../logger'
import prism from 'prism-media'
import { AudioReceiveStream } from '@discordjs/voice'
import AudioEncoding = google.cloud.speech.v1.RecognitionConfig.AudioEncoding
import * as idMap from '../utils/id-map'

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

const log = logger('components/recognize-speech')

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

    const recognizeStream: Stream.Duplex = googleSpeechClient.streamingRecognize(request)

    let inputStreamId: number | undefined
    let opusDecoderId: number | undefined
    let recognizeStreamId: number | undefined

    if (config.enableStreamDebug) {
      if (!idMap.hasObject(inputStream)) {
        inputStreamId = idMap.addObject(inputStream)
        log.debug(`New input stream with id ${inputStreamId}`)
      }

      if (!idMap.hasObject(opusDecoder)) {
        opusDecoderId = idMap.addObject(opusDecoder)
        log.debug(`New opus decoder stream with id ${opusDecoderId}`)
      }

      if (!idMap.hasObject(recognizeStream)) {
        recognizeStreamId = idMap.addObject(recognizeStream)
        log.debug(`New recognize stream with id ${recognizeStreamId}`)
      }

      inputStream
        .on('end', () => log.debug(`Input stream ${inputStreamId} end`))
        .on('close', () => log.debug(`Input stream ${inputStreamId} close`))
      opusDecoder
        .on('end', () => log.debug(`Opus decoder stream ${opusDecoderId} end`))
        .on('close', () => log.debug(`Opus decoder stream ${opusDecoderId} close`))
      recognizeStream
        .on('end', () => log.debug(`Recognize stream ${recognizeStreamId} end`))
        .on('close', () => log.debug(`Recognize stream ${recognizeStreamId} close`))
    }

    inputStream
      // Next line fixes "Long duration elapsed without audio" error because recognize stream waits for input stream to end.
      // When bot leaves channel or moves speaking user to another channel, speaking user input stream is closed
      // but not ended automatically, so we need to end it manually.
      // https://github.com/googleapis/nodejs-speech/issues/894
      .on('close', () => inputStream.emit('end'))
      .on('error', error => log.error(`Input stream ${inputStreamId} error:`, error))
    opusDecoder.on('error', error => log.error(`Opus decoder stream ${inputStreamId ?? ''} error:`, error))
    recognizeStream.on('error', error => log.error(`Recognize stream ${inputStreamId ?? ''} error:`, error))

    inputStream
      .pipe(opusDecoder)
      .pipe(recognizeStream)
      .on('data', (recognitionData: RecognitionData) => {
        const firstTranscription = recognitionData.results[0].alternatives[0].transcript
        const result = firstTranscription.toLocaleLowerCase()
        resolve(result)
      })
      .on('error', reject)
  })
}
