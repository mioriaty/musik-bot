import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
} from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';
import play from 'play-dl';

interface Song {
  title: string;
  url: string;
  requestedBy: string;
}

interface GuildQueue {
  textChannel: ChatInputCommandInteraction;
  songs: Song[];
  playing: boolean;
  connection: VoiceConnection | null;
  player: AudioPlayer | null;
  volume: number;
}

class MusicQueue {
  private queues: Map<string, GuildQueue>;

  constructor() {
    this.queues = new Map();
  }

  // Get or create a queue for a guild
  public getQueue(guildId: string, interaction: ChatInputCommandInteraction): GuildQueue {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        textChannel: interaction,
        songs: [],
        playing: false,
        connection: null,
        player: null,
        volume: 50,
      });
    }

    return this.queues.get(guildId)!;
  }

  // Add a song to the queue
  public async addSong(
    guildId: string,
    interaction: ChatInputCommandInteraction,
    query: string,
  ): Promise<Song | null> {
    try {
      let songInfo;

      // Check if the query is a YouTube URL
      if (query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
        // Handle YouTube URL directly
        try {
          const videoInfo = await play.video_info(query);
          if (videoInfo && videoInfo.video_details) {
            songInfo = videoInfo.video_details;
          } else {
            // Fallback to search if direct URL handling fails
            const searchResult = await play.search(query, { limit: 1 });
            if (searchResult.length === 0) return null;
            songInfo = searchResult[0];
          }
        } catch (urlError) {
          console.error('Error processing YouTube URL:', urlError);
          // Fallback to search
          const searchResult = await play.search(query, { limit: 1 });
          if (searchResult.length === 0) return null;
          songInfo = searchResult[0];
        }
      } else {
        // Handle search term
        const searchResult = await play.search(query, { limit: 1 });
        if (searchResult.length === 0) return null;
        songInfo = searchResult[0];
      }

      // Create song object with more details
      const song: Song = {
        title: songInfo.title || 'Unknown Title',
        url: songInfo.url,
        requestedBy: interaction.user.tag,
      };

      const queue = this.getQueue(guildId, interaction);
      queue.songs.push(song);

      return song;
    } catch (error) {
      console.error('Error adding song to queue:', error);
      return null;
    }
  }

  // Play the next song in the queue
  public async playNext(guildId: string): Promise<void> {
    const queue = this.queues.get(guildId);

    if (!queue || queue.songs.length === 0 || !queue.connection) {
      // If there are no more songs or no connection, clean up
      this.deleteQueue(guildId);
      return;
    }

    try {
      const song = queue.songs[0];

      // Create an audio player if it doesn't exist
      if (!queue.player) {
        queue.player = createAudioPlayer();
        queue.connection.subscribe(queue.player);

        // Set up event listeners
        queue.player.on(AudioPlayerStatus.Idle, () => {
          // Remove the song that just finished
          queue.songs.shift();
          // Play the next song
          this.playNext(guildId);
        });

        queue.player.on('error', (error: Error) => {
          console.error('Audio player error:', error);
          queue.textChannel.followUp('An error occurred while playing the song!');
          queue.songs.shift();
          this.playNext(guildId);
        });
      }

      // Get the stream for the song
      const stream = await play.stream(song.url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      // Play the song
      queue.player.play(resource);
      queue.playing = true;

      // Send a message that the song is playing
      queue.textChannel.followUp(
        `🎵 Now playing: **${song.title}** (requested by ${song.requestedBy})`,
      );
    } catch (error) {
      console.error('Error playing song:', error);
      queue.textChannel.followUp('An error occurred while playing the song!');
      queue.songs.shift();
      this.playNext(guildId);
    }
  }

  // Skip the current song
  public skip(guildId: string): boolean {
    const queue = this.queues.get(guildId);

    if (!queue || !queue.player) {
      return false;
    }

    queue.player.stop();
    return true;
  }

  // Pause the current playback
  public pause(guildId: string): boolean {
    const queue = this.queues.get(guildId);

    if (!queue || !queue.player) {
      return false;
    }

    queue.player.pause();
    return true;
  }

  // Resume playback
  public resume(guildId: string): boolean {
    const queue = this.queues.get(guildId);

    if (!queue || !queue.player) {
      return false;
    }

    queue.player.unpause();
    return true;
  }

  // Get the current queue
  public getQueueData(
    guildId: string,
  ): { songs: Song[]; currentSong: Song | null; isPlaying: boolean } | null {
    const queue = this.queues.get(guildId);

    if (!queue) {
      return null;
    }

    return {
      songs: [...queue.songs],
      currentSong: queue.songs[0] || null,
      isPlaying: queue.playing,
    };
  }

  // Stop playing and leave the voice channel
  public stop(guildId: string): boolean {
    const queue = this.queues.get(guildId);

    if (!queue || !queue.connection) {
      return false;
    }

    queue.songs = [];
    queue.player?.stop();
    queue.connection.destroy();
    this.deleteQueue(guildId);

    return true;
  }

  // Delete a queue
  private deleteQueue(guildId: string): void {
    this.queues.delete(guildId);
  }
}

// Export a singleton instance
export const musicQueue = new MusicQueue();
