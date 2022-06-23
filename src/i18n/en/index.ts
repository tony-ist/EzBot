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
      notPlayingAnyGame: 'User "{userName:string}" is not playing any game right now or activity status is disabled.',
      options: {
        user: 'User whose game you want to see.',
      },
    },
    addactivity: {
      description: 'Add new activity to the database.',
      roleReason: 'Role for those who enjoy {roleName:string}. Created by EzBot.',
      activityCreated: 'New activity with name "{activityName:string}" created.\nA role with the same name has also been created.\nNow you can use dashboard and channel binding for this activity.',
      options: {
        activity: 'New Activity name',
        emoji: 'Dashboard emoji',
      },
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
      options: {
        channel: 'Voice channel to connect to specified activities',
      },
      multiselect: {
        selectActivities: 'Select activities...',
      },
      buttons: {
        header: 'Channel "{channelName:string}" will be connected to these activities: "{activityNames:string}". Are you sure?',
      },
      result: {
        success: 'Channel "{channelName:string}" was connected to these activities: "{activityNames:string}".',
        cancelled: 'Cancelled.',
      },
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
    addgames: {
      description: 'Adds game (presence) names to activity',
      options: {
        gameName: 'Name of the game that you want to connect to the existing activity',
      },
      select: {
        selectActivity: 'Select the activity...',
      },
      buttons: {
        header: 'Adding game "{gameName:string}" to activity "{activityName:string}". Are you sure?',
      },
      result: {
        success: 'Game "{gameName:string}" was connected to the activity "{activityName:string}".',
        cancelled: 'Cancelled.',
      },
    },
    removeactivity: {
      description: 'Removes selected activity and associated voice channel, role and emoji',
      select: {
        selectActivity: 'Select the activity...',
      },
      buttons: {
        header: 'Removing activity "{activityName:string}", role "{roleName:string}", channel "{channelName:string}" and emoji "{emoji:string}". Are you sure?',
      },
      result: {
        success: 'Removed activity "{activityName:string}", role "{roleName:string}", channel "{channelName:string}" and emoji "{emoji:string}".',
        cancelled: 'Cancelled.',
      },
    },
    version: {
      description: 'Displays current bot version and git commit SHA',
    },
    stats: {
      description: 'Displays different server statistics.',
      noStats: 'No statistics yet. Go play some games!',
      thisWeek: '__This week users spent time in the channels:__',
      channel: '**Channel: {channelName:string}**',
      timeSpent: 'Time spent: {timeString:string}',
    },
  },
  elements: {
    buttons: {
      submit: 'Yay',
      cancel: 'Nay',
    },
    select: {
      placeholder: 'Nothing selected',
    },
  },
  notFound: 'Not found',
  errorOnCommand: 'There was an error while executing this command!',
  yesPhrases: `yes,yeah,transfer,please,yep,let's go`,
  noPhrases: `no,nope,don't,nah,get out`,
  welcomeMessage: `Welcome to the server! On the server there are roles and notifications. Open the dashboard chat and click the emojis of the games you play, you will get the roles. To call people to play a game, just mention your game's role, for example @SC2, in general chat.`,
}

export default en
