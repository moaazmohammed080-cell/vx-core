import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import colors from 'colors';
import { connectDatabase } from './src/database/connect.js';
import { loadCommands } from './src/handlers/commandHandler.js';
import { loadEvents } from './src/handlers/eventHandler.js';
import SecurityCore from './src/security/SecurityCore.js';
import { config } from './src/config/config.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildAuditLog,
    GatewayIntentBits.GuildWebhooks,
  ],
});

// Initialize collections
client.commands = new Collection();
client.buttons = new Collection();
client.cooldowns = new Collection();
client.securityCore = SecurityCore;

// Load commands, events, and database
(async () => {
  try {
    colors.setTheme({
      silly: 'rainbow',
      input: 'grey',
      verbose: 'cyan',
      prompt: 'grey',
      info: 'green',
      data: 'grey',
      help: 'cyan',
      warn: 'yellow',
      debug: 'blue',
      error: 'red',
    });

    console.log('[LOADING]'.info, 'Connecting to database...');
    await connectDatabase();
    console.log('[DATABASE]'.info, 'Connected to MongoDB successfully!');

    console.log('[LOADING]'.info, 'Initializing Security Core...');
    if (config.features.securityCore) {
      await SecurityCore.initialize();
      console.log('[SECURITY CORE]'.info, 'Security Core initialized successfully!');
    }

    console.log('[LOADING]'.info, 'Loading commands...');
    await loadCommands(client);
    console.log('[COMMANDS]'.info, `Loaded ${client.commands.size} commands`);

    console.log('[LOADING]'.info, 'Loading events...');
    await loadEvents(client);
    console.log('[EVENTS]'.info, 'Events loaded successfully!');

    await client.login(process.env.BOT_TOKEN);
  } catch (error) {
    console.error('[ERROR]'.error, 'Failed to start bot:', error);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]'.error, reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]'.error, error);
  process.exit(1);
});
