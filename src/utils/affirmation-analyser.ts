import { I18n } from '../i18n'

export enum AffirmationAnalysisResult {
  AFFIRMATION,
  DENIAL,
  NEUTRAL,
}

export function analyzeAffirmation(phrase: string) {
  if (isYesPhrase(phrase)) {
    return AffirmationAnalysisResult.AFFIRMATION
  } else if (isNoPhrase(phrase)) {
    return AffirmationAnalysisResult.DENIAL
  } else {
    return AffirmationAnalysisResult.NEUTRAL
  }
}

function isEveryPhraseWordInArray(phrase: string, array: string[]) {
  const phraseWords = phrase.replaceAll(',', '').split(' ')

  return phraseWords.every(word => array.includes(word))
}

function isYesPhrase(phrase: string) {
  const yesPhrases = I18n.yesPhrases().split(',')
  const isInYesPhrasesAsWhole: boolean = yesPhrases.includes(phrase)

  return isInYesPhrasesAsWhole || isEveryPhraseWordInArray(phrase, yesPhrases)
}

function isNoPhrase(phrase: string) {
  const noPhrases = I18n.noPhrases().split(',')
  const isInYesPhrasesAsWhole: boolean = noPhrases.includes(phrase)

  return isInYesPhrasesAsWhole || isEveryPhraseWordInArray(phrase, noPhrases)
}
