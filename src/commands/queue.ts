import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/command';
import { musicQueue } from '../utils/musicQueue';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows the current music queue') as any,

  async execute(interaction) {
    // Check if in a guild
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a server!');
    }

    // Get the current queue data
    const queueData = musicQueue.getQueueData(interaction.guildId!);

    if (!queueData || queueData.songs.length === 0) {
      return interaction.reply('There are no songs in the queue!');
    }

    // Create an embed to display the queue
    const embed = new EmbedBuilder().setTitle('🎵 Music Queue').setColor('#3498db').setTimestamp();

    // Add current song
    if (queueData.currentSong) {
      embed.addFields({
        name: '🎧 Now Playing',
        value: `**${queueData.currentSong.title}** (requested by ${queueData.currentSong.requestedBy})`,
      });
    }

    // Add upcoming songs (up to 10)
    if (queueData.songs.length > 1) {
      const upcomingSongs = queueData.songs.slice(1, 11).map((song, index) => {
        return `${index + 1}. **${song.title}** (requested by ${song.requestedBy})`;
      });

      embed.addFields({
        name: '📋 Up Next',
        value: upcomingSongs.join('\n'),
      });

      // If there are more songs than shown
      if (queueData.songs.length > 11) {
        embed.setFooter({
          text: `And ${queueData.songs.length - 11} more songs in queue`,
        });
      }
    }

    return interaction.reply({ embeds: [embed] });
  },
};
