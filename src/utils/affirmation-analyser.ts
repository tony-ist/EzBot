import { I18n } from '../i18n'

function isEveryPhraseWordInArray(phrase: string, array: string[]) {
  const phraseWords = phrase.replaceAll(',', '').split(' ')

  return phraseWords.every(word => array.includes(word))
}

export function isYesPhrase(phrase: string) {
  const yesPhrases = I18n.yesPhrases().split(',')
  const isInYesPhrasesAsWhole: boolean = yesPhrases.includes(phrase)

  return isInYesPhrasesAsWhole || isEveryPhraseWordInArray(phrase, yesPhrases)
}

export function isNoPhrase(phrase: string) {
  const noPhrases = I18n.noPhrases().split(',')
  const isInYesPhrasesAsWhole: boolean = noPhrases.includes(phrase)

  return isInYesPhrasesAsWhole || isEveryPhraseWordInArray(phrase, noPhrases)
}
