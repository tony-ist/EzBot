import type { BaseTranslation } from '../i18n-types'

const en: BaseTranslation = {
  commands: {
    ping: {
      description: 'Bot responds with pong!',
    },
    help: {
      description: 'Displays help on bot commands.',
    },
    addactivity: {
      description: 'Add new activity to the database.',
    },
  },
  errorOnCommand: 'There was an error while executing this command!',
}

export default en
