module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-var': 'error',
    'no-redeclare': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    }],
    'array-bracket-spacing': ['error', 'never'],
    '@typescript-eslint/explicit-function-return-type': 0,
    'no-console': 'error',
  },
}
