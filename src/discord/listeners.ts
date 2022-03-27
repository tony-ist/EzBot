import Discord, { MessageReaction, Presence, User } from 'discord.js'
import { commandStore } from '../commands/command-list'
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import fs from 'fs'
import logger from '../logger'

const log = logger('listeners')

type ListenerFunction = (...args: any[]) => Promise<void>

function wrapErrorHandling(f: ListenerFunction): ListenerFunction {
  return async (...args) => {
    try {
      await f(...args)
    } catch (error) {
      log.error('There was an error in the listener', error)
    }
  }
}

async function onReady(discordClient: Discord.Client): Promise<void> {
  log.debug(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
}

async function onPresenceUpdate(oldPresence: Presence, newPresence: Presence): Promise<void> {
  const member = newPresence.member
  const guild = newPresence.guild
  const voiceChannel = member?.voice.channel

  if (voiceChannel?.id === undefined) {
    return
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

  // interaction.commandName is a string. There is no guarantee that it is of AllCommandNames type.
  const command = commandStore.get(interaction.commandName as any)
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

async function onMessageReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
  if (reaction.message.id !== '957670983156785182') {
    return
  }

  const roles = reaction.message.guild?.roles

  if (roles === undefined) {
    throw new Error('reaction.message.guild?.roles is undefined')
  }

  await roles.fetch()

  const role = roles.cache.find((r) => r.name === 'dummy')

  if (role === undefined) {
    throw new Error('dummy role is undefined')
  }

  const members = reaction.message.guild?.members

  if (members === undefined) {
    throw new Error('reaction.message.guild?.members is undefined')
  }

  const member = await members.fetch(user)
  await member.roles.add(role)
}

export function registerDiscordListeners(discordClient: Discord.Client): void {
  discordClient.on('ready', wrapErrorHandling(onReady))
  discordClient.on('presenceUpdate', wrapErrorHandling(onPresenceUpdate))
  discordClient.on('interactionCreate', wrapErrorHandling(onInteractionCreate))
  discordClient.on('messageReactionAdd', wrapErrorHandling(onMessageReactionAdd))
}
