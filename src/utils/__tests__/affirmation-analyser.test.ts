import { isNoPhrase, isYesPhrase } from '../affirmation-analyser'

const neutralPhrases = [
  `don't know`,
  'probably not',
  'yes no',
  'no, please',
  'no please',
  'please no',
  'neutral phrase',
  'transfer me',
]

describe('affirmation-analyser', () => {
  describe('isYesPhrase', () => {
    it.each([
      'yes',
      'transfer',
      'please',
      'yes please',
      'yes, please',
      'transfer, yes',
      'yep',
      'yeah',
      `let's go`,
    ])('should return true for yes phrase', (phrase) => {
      expect(isYesPhrase(phrase)).toBe(true)
    })

    it.each(neutralPhrases)('should return false for neutral phrases', (phrase) => {
      expect(isYesPhrase(phrase)).toBe(false)
    })
  })

  describe('isNoPhrase', () => {
    it.each([
      'no',
      'nope',
      `no, don't`,
      `no don't`,
      'nah',
      'get out',
    ])('should return true for no phrase', (phrase) => {
      expect(isNoPhrase(phrase)).toBe(true)
    })

    it.each(neutralPhrases)('should return false for neutral phrases', (phrase) => {
      expect(isNoPhrase(phrase)).toBe(false)
    })
  })
})
