// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en'

export type Locales =
	| 'en'
	| 'ru'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	commands: {
		ping: {
			/**
			 * Bot responds with pong!
			 */
			description: string
		}
		help: {
			/**
			 * Displays help on bot commands.
			 */
			description: string
		}
		game: {
			/**
			 * Displays the name of the current game you are playing.
			 */
			description: string
			/**
			 * User "{userName}" is not playing any game right now or activity status is disabled.
			 * @param {string} userName
			 */
			notPlayingAnyGame: RequiredParams<'userName'>
			options: {
				/**
				 * User whose game you want to see.
				 */
				user: string
			}
		}
		addactivity: {
			/**
			 * Add new activity to the database.
			 */
			description: string
			/**
			 * Role for those who enjoy {roleName}. Created by EzBot.
			 * @param {string} roleName
			 */
			roleReason: RequiredParams<'roleName'>
			/**
			 * New activity with name "{activityName}" created.
		A role with the same name has also been created.
		Now you can use dashboard and channel binding for this activity.
			 * @param {string} activityName
			 */
			activityCreated: RequiredParams<'activityName'>
			options: {
				/**
				 * New Activity name
				 */
				activity: string
				/**
				 * Dashboard emoji
				 */
				emoji: string
			}
			errors: {
				/**
				 * Activity name is required.
				 */
				propActivityNameIsRequired: string
				/**
				 * Emoji is required and should be valid emoji. For example ":SC2:".
				 */
				propEmojiShouldBeValidEmoji: string
				/**
				 * Activity with the name "{activityName}" already exists.
				 * @param {string} activityName
				 */
				activityWithThatNameExists: RequiredParams<'activityName'>
			}
		}
		summon: {
			/**
			 * Summons bot to join your channel and to ask a question whether you want to be transferred.
			 */
			description: string
			/**
			 * Cannot summon the bot, start the game first and/or turn activity status on!
			 */
			cannotSummon: string
			/**
			 * Cannot summon the bot, you are in the right channel!
			 */
			inTheRightChannel: string
			/**
			 * Cannot summon the bot, it is already in a voice channel!
			 */
			alreadyInChannel: string
			/**
			 * Summoning bot in the channel...
			 */
			canSummon: string
			/**
			 * Cannot summon the bot, you are not in a voice channel!
			 */
			userNotInVoiceChannel: string
		}
		connectchannel: {
			/**
			 * Connects the chosen channel and the chosen activities.
			 */
			description: string
			options: {
				/**
				 * Voice channel to connect to specified activities
				 */
				channel: string
			}
			multiselect: {
				/**
				 * Select activities...
				 */
				selectActivities: string
			}
			buttons: {
				/**
				 * Channel "{channelName}" will be connected to these activities: "{activityNames}". Are you sure?
				 * @param {string} activityNames
				 * @param {string} channelName
				 */
				header: RequiredParams<'activityNames' | 'channelName'>
			}
			result: {
				/**
				 * Channel "{channelName}" was connected to these activities: "{activityNames}".
				 * @param {string} activityNames
				 * @param {string} channelName
				 */
				success: RequiredParams<'activityNames' | 'channelName'>
				/**
				 * Cancelled.
				 */
				cancelled: string
			}
		}
		showactivities: {
			/**
			 * Displays all activities.
			 */
			description: string
			/**
			 * Activity: {activityName}
		Emoji: {emoji}
		Role: {roleName}
		Role ID: {roleId}
		Channel: {channelName}
		Channel ID: {channelId}
		Games: {presenceNames}
	
			 * @param {string} activityName
			 * @param {string} channelId
			 * @param {string} channelName
			 * @param {string} emoji
			 * @param {string} presenceNames
			 * @param {string} roleId
			 * @param {string} roleName
			 */
			formatActivity: RequiredParams<'activityName' | 'channelId' | 'channelName' | 'emoji' | 'presenceNames' | 'roleId' | 'roleName'>
		}
		addgames: {
			/**
			 * Adds game (presence) names to activity
			 */
			description: string
			options: {
				/**
				 * Name of the game that you want to connect to the existing activity
				 */
				gameName: string
			}
			select: {
				/**
				 * Select the activity...
				 */
				selectActivity: string
			}
			buttons: {
				/**
				 * Adding game "{gameName}" to activity "{activityName}". Are you sure?
				 * @param {string} activityName
				 * @param {string} gameName
				 */
				header: RequiredParams<'activityName' | 'gameName'>
			}
			result: {
				/**
				 * Game "{gameName}" was connected to the activity "{activityName}".
				 * @param {string} activityName
				 * @param {string} gameName
				 */
				success: RequiredParams<'activityName' | 'gameName'>
				/**
				 * Cancelled.
				 */
				cancelled: string
			}
		}
		removeactivity: {
			/**
			 * Removes selected activity and associated voice channel, role and emoji
			 */
			description: string
			select: {
				/**
				 * Select the activity...
				 */
				selectActivity: string
			}
			buttons: {
				/**
				 * Removing activity "{activityName}", role "{roleName}", channel "{channelName}" and emoji "{emoji}". Are you sure?
				 * @param {string} activityName
				 * @param {string} channelName
				 * @param {string} emoji
				 * @param {string} roleName
				 */
				header: RequiredParams<'activityName' | 'channelName' | 'emoji' | 'roleName'>
			}
			result: {
				/**
				 * Removed activity "{activityName}", role "{roleName}", channel "{channelName}" and emoji "{emoji}".
				 * @param {string} activityName
				 * @param {string} channelName
				 * @param {string} emoji
				 * @param {string} roleName
				 */
				success: RequiredParams<'activityName' | 'channelName' | 'emoji' | 'roleName'>
				/**
				 * Cancelled.
				 */
				cancelled: string
			}
		}
		version: {
			/**
			 * Displays current bot version and git commit SHA
			 */
			description: string
		}
		stats: {
			/**
			 * Displays different server statistics.
			 */
			description: string
			/**
			 * No statistics yet. Go play some games!
			 */
			noStats: string
			/**
			 * This week users spent time in the channels:
			 */
			thisWeek: string
		}
	}
	elements: {
		buttons: {
			/**
			 * Yay
			 */
			submit: string
			/**
			 * Nay
			 */
			cancel: string
		}
		select: {
			/**
			 * Nothing selected
			 */
			placeholder: string
		}
	}
	/**
	 * Not found
	 */
	notFound: string
	/**
	 * There was an error while executing this command!
	 */
	errorOnCommand: string
	/**
	 * yes,yeah,transfer,please,yep,let's go
	 */
	yesPhrases: string
	/**
	 * no,nope,don't,nah,get out
	 */
	noPhrases: string
	/**
	 * Welcome to the server! On the server there are roles and notifications. Open the dashboard chat and click the emojis of the games you play, you will get the roles. To call people to play a game, just mention your game's role, for example @SC2, in general chat.
	 */
	welcomeMessage: string
}

export type TranslationFunctions = {
	commands: {
		ping: {
			/**
			 * Bot responds with pong!
			 */
			description: () => LocalizedString
		}
		help: {
			/**
			 * Displays help on bot commands.
			 */
			description: () => LocalizedString
		}
		game: {
			/**
			 * Displays the name of the current game you are playing.
			 */
			description: () => LocalizedString
			/**
			 * User "{userName}" is not playing any game right now or activity status is disabled.
			 */
			notPlayingAnyGame: (arg: { userName: string }) => LocalizedString
			options: {
				/**
				 * User whose game you want to see.
				 */
				user: () => LocalizedString
			}
		}
		addactivity: {
			/**
			 * Add new activity to the database.
			 */
			description: () => LocalizedString
			/**
			 * Role for those who enjoy {roleName}. Created by EzBot.
			 */
			roleReason: (arg: { roleName: string }) => LocalizedString
			/**
			 * New activity with name "{activityName}" created.
		A role with the same name has also been created.
		Now you can use dashboard and channel binding for this activity.
			 */
			activityCreated: (arg: { activityName: string }) => LocalizedString
			options: {
				/**
				 * New Activity name
				 */
				activity: () => LocalizedString
				/**
				 * Dashboard emoji
				 */
				emoji: () => LocalizedString
			}
			errors: {
				/**
				 * Activity name is required.
				 */
				propActivityNameIsRequired: () => LocalizedString
				/**
				 * Emoji is required and should be valid emoji. For example ":SC2:".
				 */
				propEmojiShouldBeValidEmoji: () => LocalizedString
				/**
				 * Activity with the name "{activityName}" already exists.
				 */
				activityWithThatNameExists: (arg: { activityName: string }) => LocalizedString
			}
		}
		summon: {
			/**
			 * Summons bot to join your channel and to ask a question whether you want to be transferred.
			 */
			description: () => LocalizedString
			/**
			 * Cannot summon the bot, start the game first and/or turn activity status on!
			 */
			cannotSummon: () => LocalizedString
			/**
			 * Cannot summon the bot, you are in the right channel!
			 */
			inTheRightChannel: () => LocalizedString
			/**
			 * Cannot summon the bot, it is already in a voice channel!
			 */
			alreadyInChannel: () => LocalizedString
			/**
			 * Summoning bot in the channel...
			 */
			canSummon: () => LocalizedString
			/**
			 * Cannot summon the bot, you are not in a voice channel!
			 */
			userNotInVoiceChannel: () => LocalizedString
		}
		connectchannel: {
			/**
			 * Connects the chosen channel and the chosen activities.
			 */
			description: () => LocalizedString
			options: {
				/**
				 * Voice channel to connect to specified activities
				 */
				channel: () => LocalizedString
			}
			multiselect: {
				/**
				 * Select activities...
				 */
				selectActivities: () => LocalizedString
			}
			buttons: {
				/**
				 * Channel "{channelName}" will be connected to these activities: "{activityNames}". Are you sure?
				 */
				header: (arg: { activityNames: string, channelName: string }) => LocalizedString
			}
			result: {
				/**
				 * Channel "{channelName}" was connected to these activities: "{activityNames}".
				 */
				success: (arg: { activityNames: string, channelName: string }) => LocalizedString
				/**
				 * Cancelled.
				 */
				cancelled: () => LocalizedString
			}
		}
		showactivities: {
			/**
			 * Displays all activities.
			 */
			description: () => LocalizedString
			/**
			 * Activity: {activityName}
		Emoji: {emoji}
		Role: {roleName}
		Role ID: {roleId}
		Channel: {channelName}
		Channel ID: {channelId}
		Games: {presenceNames}
	
			 */
			formatActivity: (arg: { activityName: string, channelId: string, channelName: string, emoji: string, presenceNames: string, roleId: string, roleName: string }) => LocalizedString
		}
		addgames: {
			/**
			 * Adds game (presence) names to activity
			 */
			description: () => LocalizedString
			options: {
				/**
				 * Name of the game that you want to connect to the existing activity
				 */
				gameName: () => LocalizedString
			}
			select: {
				/**
				 * Select the activity...
				 */
				selectActivity: () => LocalizedString
			}
			buttons: {
				/**
				 * Adding game "{gameName}" to activity "{activityName}". Are you sure?
				 */
				header: (arg: { activityName: string, gameName: string }) => LocalizedString
			}
			result: {
				/**
				 * Game "{gameName}" was connected to the activity "{activityName}".
				 */
				success: (arg: { activityName: string, gameName: string }) => LocalizedString
				/**
				 * Cancelled.
				 */
				cancelled: () => LocalizedString
			}
		}
		removeactivity: {
			/**
			 * Removes selected activity and associated voice channel, role and emoji
			 */
			description: () => LocalizedString
			select: {
				/**
				 * Select the activity...
				 */
				selectActivity: () => LocalizedString
			}
			buttons: {
				/**
				 * Removing activity "{activityName}", role "{roleName}", channel "{channelName}" and emoji "{emoji}". Are you sure?
				 */
				header: (arg: { activityName: string, channelName: string, emoji: string, roleName: string }) => LocalizedString
			}
			result: {
				/**
				 * Removed activity "{activityName}", role "{roleName}", channel "{channelName}" and emoji "{emoji}".
				 */
				success: (arg: { activityName: string, channelName: string, emoji: string, roleName: string }) => LocalizedString
				/**
				 * Cancelled.
				 */
				cancelled: () => LocalizedString
			}
		}
		version: {
			/**
			 * Displays current bot version and git commit SHA
			 */
			description: () => LocalizedString
		}
		stats: {
			/**
			 * Displays different server statistics.
			 */
			description: () => LocalizedString
			/**
			 * No statistics yet. Go play some games!
			 */
			noStats: () => LocalizedString
			/**
			 * This week users spent time in the channels:
			 */
			thisWeek: () => LocalizedString
		}
	}
	elements: {
		buttons: {
			/**
			 * Yay
			 */
			submit: () => LocalizedString
			/**
			 * Nay
			 */
			cancel: () => LocalizedString
		}
		select: {
			/**
			 * Nothing selected
			 */
			placeholder: () => LocalizedString
		}
	}
	/**
	 * Not found
	 */
	notFound: () => LocalizedString
	/**
	 * There was an error while executing this command!
	 */
	errorOnCommand: () => LocalizedString
	/**
	 * yes,yeah,transfer,please,yep,let's go
	 */
	yesPhrases: () => LocalizedString
	/**
	 * no,nope,don't,nah,get out
	 */
	noPhrases: () => LocalizedString
	/**
	 * Welcome to the server! On the server there are roles and notifications. Open the dashboard chat and click the emojis of the games you play, you will get the roles. To call people to play a game, just mention your game's role, for example @SC2, in general chat.
	 */
	welcomeMessage: () => LocalizedString
}

export type Formatters = {}
