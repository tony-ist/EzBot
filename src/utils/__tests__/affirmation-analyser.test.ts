import { AffirmationAnalysisResult, analyzeAffirmation } from '../affirmation-analyser'

describe('affirmation-analyser', () => {
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
  ])('should return AFFIRMATION for yes phrase', (phrase) => {
    expect(analyzeAffirmation(phrase) === AffirmationAnalysisResult.AFFIRMATION)
  })

  it.each([
    'no',
    'nope',
    `no, don't`,
    `no don't`,
    'nah',
    'get out',
  ])('should return DENIAL for no phrase', (phrase) => {
    expect(analyzeAffirmation(phrase) === AffirmationAnalysisResult.DENIAL)
  })

  it.each([
      `don't know`,
      'probably not',
      'yes no',
      'no, please',
      'no please',
      'please no',
      'neutral phrase',
      'transfer me',
  ])('should return NEUTRAL for unknown phrase', (phrase) => {
    expect(analyzeAffirmation(phrase) === AffirmationAnalysisResult.NEUTRAL)
  })
})
