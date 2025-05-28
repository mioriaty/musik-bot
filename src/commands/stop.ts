import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/command';
import { musicQueue } from '../utils/musicQueue';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops playing music and leaves the voice channel') as any,

  async execute(interaction) {
    // Check if member is a GuildMember to access voice channel
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a server!');
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to use this command!');
    }

    // Stop playing and leave the voice channel using the music queue
    const stopped = musicQueue.stop(interaction.guildId!);

    if (!stopped) {
      return interaction.reply('I am not currently in a voice channel!');
    }

    return interaction.reply('⏹️ Stopped playing music and left the voice channel!');
  },
};
