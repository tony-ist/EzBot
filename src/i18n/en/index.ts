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
      roleReason: 'Role for those who enjoy {roleName:string}. Created by EzBot.',
      activityCreated: 'New activity with name `{activityName:string}` created.\nA role with the same name has also been created.\nNow you can use dashboard and channel binding for this activity.',
      errors: {
        propActivityNameIsRequired: 'Activity name is required.',
        propEmojiShouldBeValidEmoji: 'Emoji is required and should be valid emoji. For example `:SC2:`.',
      },
    },
  },
  errorOnCommand: 'There was an error while executing this command!',
  yesWords: 'yes,yeah',
  noWords: 'no,nope',
}

export default en
