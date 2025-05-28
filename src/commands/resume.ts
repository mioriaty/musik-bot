import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/command';
import { musicQueue } from '../utils/musicQueue';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes playback of the current song') as any,

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

    // Resume playback using the music queue
    const resumed = musicQueue.resume(interaction.guildId!);

    if (!resumed) {
      return interaction.reply('There is nothing paused to resume!');
    }

    return interaction.reply('▶️ Resumed playback!');
  },
};
