/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupFiles: ['./src/tests-setup/tests-setup.ts'],
  moduleNameMapper: {
    'typesafe-i18n/angular': 'typesafe-i18n/angular/index.cjs',
    'typesafe-i18n/react': 'typesafe-i18n/react/index.cjs',
    'typesafe-i18n/solid': 'typesafe-i18n/solid/index.cjs',
    'typesafe-i18n/svelte': 'typesafe-i18n/svelte/index.cjs',
    'typesafe-i18n/vue': 'typesafe-i18n/vue/index.cjs',
    'typesafe-i18n/formatters': 'typesafe-i18n/formatters/index.cjs',
    'typesafe-i18n/detectors': 'typesafe-i18n/detectors/index.cjs',
  },
}
