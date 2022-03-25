module.exports = {
  isTranscriptionContains: (transcription, words) => {
    return words.indexOf(transcription) > -1
  },
}
