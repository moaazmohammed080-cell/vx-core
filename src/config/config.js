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
    securityCore: process.env.SECURITY_CORE_ENABLED === 'true' || true,
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
    securityLogs: process.env.SECURITY_LOG_CHANNEL_ID,
  },
  
  // Bot Settings
  bot: {
    status: process.env.BOT_STATUS || 'online',
    activity: process.env.BOT_ACTIVITY || 'Slash Commands',
  },

  // Security Core Configuration
  security: {
    enabled: process.env.SECURITY_ENABLED === 'true' || true,
    antiRaid: {
      enabled: process.env.ANTI_RAID_ENABLED === 'true' || true,
      joinThreshold: parseInt(process.env.ANTI_RAID_THRESHOLD) || 10,
      action: process.env.ANTI_RAID_ACTION || 'ban',
    },
    antiNuke: {
      enabled: process.env.ANTI_NUKE_ENABLED === 'true' || true,
      deleteThreshold: parseInt(process.env.ANTI_NUKE_THRESHOLD) || 3,
      roleDeleteThreshold: parseInt(process.env.ANTI_NUKE_ROLE_THRESHOLD) || 2,
      action: process.env.ANTI_NUKE_ACTION || 'ban',
    },
    antiSpam: {
      enabled: process.env.ANTI_SPAM_ENABLED === 'true' || true,
      messageLimit: parseInt(process.env.ANTI_SPAM_LIMIT) || 5,
      timeWindow: parseInt(process.env.ANTI_SPAM_WINDOW) || 5000,
      action: process.env.ANTI_SPAM_ACTION || 'mute',
    },
    antiLink: {
      enabled: process.env.ANTI_LINK_ENABLED === 'true' || true,
      action: process.env.ANTI_LINK_ACTION || 'delete',
    },
    antiInvite: {
      enabled: process.env.ANTI_INVITE_ENABLED === 'true' || true,
      action: process.env.ANTI_INVITE_ACTION || 'delete',
    },
    antiWebhook: {
      enabled: process.env.ANTI_WEBHOOK_ENABLED === 'true' || false,
      blockAll: process.env.ANTI_WEBHOOK_BLOCK_ALL === 'true' || false,
    },
    antiBot: {
      enabled: process.env.ANTI_BOT_ENABLED === 'true' || false,
      blockAll: process.env.ANTI_BOT_BLOCK_ALL === 'true' || false,
    },
    antiChannel: {
      enabled: process.env.ANTI_CHANNEL_ENABLED === 'true' || false,
      blockAll: process.env.ANTI_CHANNEL_BLOCK_ALL === 'true' || false,
    },
    antiRole: {
      enabled: process.env.ANTI_ROLE_ENABLED === 'true' || false,
      blockAll: process.env.ANTI_ROLE_BLOCK_ALL === 'true' || false,
    },
    antiGuild: {
      enabled: process.env.ANTI_GUILD_ENABLED === 'true' || true,
    },
    whitelist: {
      enabled: process.env.WHITELIST_ENABLED === 'true' || true,
    },
    blacklist: {
      enabled: process.env.BLACKLIST_ENABLED === 'true' || true,
    },
    backup: {
      enabled: process.env.BACKUP_ENABLED === 'true' || true,
      autoBackupInterval: parseInt(process.env.AUTO_BACKUP_INTERVAL) || 86400000, // 24 hours
    },
    recovery: {
      enabled: process.env.RECOVERY_ENABLED === 'true' || true,
    },
  },
};
