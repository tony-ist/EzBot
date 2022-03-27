import Discord, { Presence } from 'discord.js'
import { commandStore } from '../commands/command-list'
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import fs from 'fs'

type ListenerFunction = (...args: any[]) => Promise<void>

function wrapErrorHandling(f: ListenerFunction): ListenerFunction {
  return async (...args) => {
    try {
      await f(...args)
    } catch (error) {
      console.error(error)
    }
  }
}

async function onReady(discordClient: Discord.Client): Promise<void> {
  console.log(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
}

async function onPresenceUpdate(oldPresence: Presence, newPresence: Presence): Promise<void> {
  const member = newPresence.member
  const guild = newPresence.guild
  const voiceChannel = member?.voice.channel

  if (voiceChannel?.id === undefined) {
    throw new Error('Voice channel or its id is undefined')
  }

  if (guild === undefined || guild === null) {
    throw new Error(`Guild is ${String(guild)}`)
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel?.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  })

  const resource = createAudioResource(fs.createReadStream('./audio/wrongChannelRu.mp3'))
  const player = createAudioPlayer()

  connection.subscribe(player)
  player.play(resource)
}

async function onInteractionCreate(interaction: Discord.Interaction): Promise<void> {
  if (!interaction.isCommand()) return

  const command = commandStore.get(interaction.commandName)

  if (command === undefined || command === null) {
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    // TODO: I18n
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    throw error
  }
}

export function registerDiscordListeners(discordClient: Discord.Client): void {
  discordClient.on('ready', wrapErrorHandling(onReady))
  discordClient.on('presenceUpdate', wrapErrorHandling(onPresenceUpdate))
  discordClient.on('interactionCreate', wrapErrorHandling(onInteractionCreate))
}
