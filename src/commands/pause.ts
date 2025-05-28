import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/command';
import { musicQueue } from '../utils/musicQueue';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the currently playing song') as any,

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

    // Pause the current song using the music queue
    const paused = musicQueue.pause(interaction.guildId!);

    if (!paused) {
      return interaction.reply('There is nothing playing to pause!');
    }

    return interaction.reply('⏸️ Paused the current song!');
  },
};
