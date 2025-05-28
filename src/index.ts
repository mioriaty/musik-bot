import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Command } from './types/command';

// Load environment variables
config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Extend client to include commands
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith('.js') || file.endsWith('.ts'));

// Function to load commands
async function loadCommands() {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      // Use dynamic import instead of require
      const commandModule = await import(filePath);
      const command = commandModule.command;

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if (command && 'data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    } catch (error) {
      console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
    }
  }
}

// Load commands
loadCommands();

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
