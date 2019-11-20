# Requirements

* [Node v10.13.0](https://github.com/nvm-sh/nvm)
* [MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials)
* [FFmpeg](https://www.johnvansickle.com/ffmpeg/)

# Setup

1. Copy your Google API credentials into credentials folder.
1. Add `GOOGLE_APPLICATION_CREDENTIALS="credentials/your-credentials.json"` to `.env` file.
1. Create database and user in mongodb
1. Configure your server id, Discord API token, dbConnectionUrl and dbName in config.json. (You can `npm start` and then stop app to create config.json)
1. `npm install`
1. `npm start`

# Usage

Type `!help` in discord chat to get bot commands help.

You can associate channels and games using bot commands. When bot detects a player starting a game when he is not in the correct channel, bot will join that channel and ask all players in that channel if they want to get moved to correct channel.

Also you can create a message which players can use to assign roles to themselves. When player places emote on the message he gets the role associated with that emote. Currently you need to manually create collection ReactionMessages with a single document with a single field `id: your_message_id`.

# Help

You can find very detailed guide on how to write your own bot with voice recoginition on https://refruity.xyz/writing-discord-bot/