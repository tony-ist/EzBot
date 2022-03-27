import Discord, { MessageReaction, Presence, User } from 'discord.js'
import { commandStore } from '../commands/command-list'
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import fs from 'fs'

type ListenerFunction = (...args: any[]) => Promise<void>

function wrapErrorHandling(f: ListenerFunction): ListenerFunction {
  return async (...args) => {
    try {
      await f(...args)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }
}

async function onReady(discordClient: Discord.Client): Promise<void> {
  // eslint-disable-next-line no-console
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

  // interaction.commandName isn't allowed string literal, just use any to avoid error
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
