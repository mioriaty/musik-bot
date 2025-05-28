# Discord Music Bot

A TypeScript-based Discord music bot that can play music from YouTube in voice channels.

## Features

- Play music from YouTube via URL or search term
- Skip the current song
- Stop playback and leave the voice channel
- Slash command support

## Prerequisites

- Node.js 16.9.0 or higher
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- Discord Application Client ID

## Installation

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy the `.env.example` file to `.env` and fill in your Discord bot token and client ID:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your Discord bot token and client ID

## Usage

1. Register slash commands with Discord:

```bash
pnpm run deploy-commands
```

2. Start the bot:

```bash
pnpm run dev
```

For production use:

```bash
pnpm run build
pnpm run start
```

## Commands

- `/play <query>` - Play a song from YouTube (URL or search term)
- `/skip` - Skip the current song
- `/stop` - Stop playback and leave the voice channel

## Adding the Bot to Your Server

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "OAuth2" tab
4. In the "URL Generator" section, select the following scopes:
   - `bot`
   - `applications.commands`
5. In the "Bot Permissions" section, select:
   - "Send Messages"
   - "Connect"
   - "Speak"
   - "Use Voice Activity"
6. Copy the generated URL and open it in your browser to add the bot to your server

## License

MIT
# musik-bot
