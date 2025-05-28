import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/command';
import { joinVoiceChannel } from '@discordjs/voice';
import { musicQueue } from '../utils/musicQueue';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('The song to play (URL or search term)')
        .setRequired(true),
    ) as any,

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    // Check if member is a GuildMember to access voice channel
    if (!interaction.guild) {
      return interaction.followUp('This command can only be used in a server!');
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.followUp('You need to be in a voice channel to use this command!');
    }

    try {
      // Get the guild queue
      const queue = musicQueue.getQueue(interaction.guildId!, interaction);

      // Add the song to the queue
      const song = await musicQueue.addSong(interaction.guildId!, interaction, query);

      if (!song) {
        return interaction.followUp('No results found for your query!');
      }

      // If there's no connection, join the voice channel
      if (!queue.connection) {
        queue.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId!,
          adapterCreator: interaction.guild.voiceAdapterCreator as any,
        });
      }

      // Check if the query is a YouTube URL
      const isYouTubeUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);

      // If this is the first song or not currently playing, start playback
      if (queue.songs.length === 1 || !queue.playing) {
        // Provide different messages based on whether it's a URL or search
        if (isYouTubeUrl) {
          await interaction.followUp(`🎵 Now playing YouTube video: **${song.title}**`);
        } else {
          await interaction.followUp(`🎵 Found and playing: **${song.title}**`);
        }
        await musicQueue.playNext(interaction.guildId!);
      } else {
        // Provide different messages based on whether it's a URL or search
        if (isYouTubeUrl) {
          interaction.followUp(`🎵 Added YouTube video to queue: **${song.title}**`);
        } else {
          interaction.followUp(`🎵 Added to queue: **${song.title}**`);
        }
      }
    } catch (error) {
      console.error(error);
      interaction.followUp('An error occurred while executing this command!');
    }
  },
};
