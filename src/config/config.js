import dotenv from 'dotenv';

dotenv.config();

export const config = {
  token: process.env.BOT_TOKEN,
  mongodbUri: process.env.MONGODB_URI,
  guildId: process.env.GUILD_ID,
  prefix: process.env.COMMAND_PREFIX || '!',
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Features
  features: {
    ticketSystem: process.env.TICKET_SYSTEM_ENABLED === 'true',
    giveawaySystem: process.env.GIVEAWAY_SYSTEM_ENABLED === 'true',
    creditSystem: process.env.CREDIT_SYSTEM_ENABLED === 'true',
    levelSystem: process.env.LEVEL_SYSTEM_ENABLED === 'true',
    verification: process.env.VERIFICATION_ENABLED === 'true',
    autoRole: process.env.AUTO_ROLE_ENABLED === 'true',
  },
  
  // Role IDs
  roles: {
    verification: process.env.VERIFICATION_ROLE_ID,
    mod: process.env.MOD_ROLE_ID,
    admin: process.env.ADMIN_ROLE_ID,
  },
  
  // Channel IDs
  channels: {
    logs: process.env.LOG_CHANNEL_ID,
    welcome: process.env.WELCOME_CHANNEL_ID,
    ticketLogs: process.env.TICKET_LOG_CHANNEL_ID,
    giveawayLogs: process.env.GIVEAWAY_LOG_CHANNEL_ID,
  },
  
  // Bot Settings
  bot: {
    status: process.env.BOT_STATUS || 'online',
    activity: process.env.BOT_ACTIVITY || 'Slash Commands',
  },
};
