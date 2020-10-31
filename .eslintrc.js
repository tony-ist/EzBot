// eslint-disable-next-line no-unused-vars
const OFF = 0; const WARN = 1; const ERROR = 2

module.exports = {
  'extends': 'standard',
  'rules': {
    'no-var': ERROR,
    'no-redeclare': ERROR,
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'array-bracket-spacing': ['error', 'never']
  }
}
