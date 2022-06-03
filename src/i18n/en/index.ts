import type { BaseTranslation } from '../i18n-types'

const en: BaseTranslation = {
  commands: {
    ping: {
      description: 'Bot responds with pong!',
    },
    help: {
      description: 'Displays help on bot commands.',
    },
    game: {
      description: 'Displays the name of the current game you are playing.',
      notPlayingAnyGame: 'You are not playing any game right now or activity status is disabled.',
    },
    addactivity: {
      description: 'Add new activity to the database.',
      roleReason: 'Role for those who enjoy {roleName:string}. Created by EzBot.',
      activityCreated: 'New activity with name "{activityName:string}" created.\nA role with the same name has also been created.\nNow you can use dashboard and channel binding for this activity.',
      errors: {
        propActivityNameIsRequired: 'Activity name is required.',
        propEmojiShouldBeValidEmoji: 'Emoji is required and should be valid emoji. For example ":SC2:".',
        activityWithThatNameExists: 'Activity with the name "{activityName:string}" already exists.',
      },
    },
    summon: {
      description: 'Summons bot to join your channel and to ask a question whether you want to be transferred.',
      cannotSummon: 'Cannot summon the bot, start the game first and/or turn activity status on!',
      inTheRightChannel: 'Cannot summon the bot, you are in the right channel!',
      alreadyInChannel: 'Cannot summon the bot, it is already in a voice channel!',
      canSummon: 'Summoning bot in the channel...',
      userNotInVoiceChannel: 'Cannot summon the bot, you are not in a voice channel!',
    },
    connectchannel: {
      description: 'Connects the chosen channel and the chosen activities.',
    },
    showactivities: {
      description: 'Displays all activities.',
      formatActivity: 'Activity: {activityName:string}\n' +
        'Emoji: {emoji:string}\n' +
        'Role: {roleName:string}\n' +
        'Role ID: {roleId:string}\n' +
        'Channel: {channelName:string}\n' +
        'Channel ID: {channelId:string}\n' +
        'Games: {presenceNames:string}\n',
    },
  },
  errorOnCommand: 'There was an error while executing this command!',
  yesPhrases: `yes,yeah,transfer,please,yep,let's go`,
  noPhrases: `no,nope,don't,nah,get out`,
}

export default en
