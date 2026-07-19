import SecuritySettingsModel from '../database/models/SecuritySettingsModel.js';
import WhitelistSystem from './WhitelistSystem.js';
import BlacklistSystem from './BlacklistSystem.js';
import AuditLogger from './AuditLogger.js';
import AntiRaid from './modules/AntiRaid.js';
import AntiNuke from './modules/AntiNuke.js';
import AntiSpam from './modules/AntiSpam.js';
import AntiLink from './modules/AntiLink.js';
import AntiInvite from './modules/AntiInvite.js';
import AntiWebhook from './modules/AntiWebhook.js';
import AntiBot from './modules/AntiBot.js';
import AntiChannel from './modules/AntiChannel.js';
import AntiRole from './modules/AntiRole.js';
import AntiGuild from './modules/AntiGuild.js';
import Backup from './modules/Backup.js';
import Recovery from './modules/Recovery.js';

export class SecurityCore {
  constructor() {
    this.modules = new Map();
    this.whitelist = WhitelistSystem;
    this.blacklist = BlacklistSystem;
    this.auditLogger = AuditLogger;
    this.backup = Backup;
    this.recovery = Recovery;
    this.activeGuilds = new Set();
  }

  async initialize() {
    console.log('[SECURITY CORE]'.info, 'Initializing security modules...');

    // Register all protection modules
    this.modules.set('antiRaid', AntiRaid);
    this.modules.set('antiNuke', AntiNuke);
    this.modules.set('antiSpam', AntiSpam);
    this.modules.set('antiLink', AntiLink);
    this.modules.set('antiInvite', AntiInvite);
    this.modules.set('antiWebhook', AntiWebhook);
    this.modules.set('antiBot', AntiBot);
    this.modules.set('antiChannel', AntiChannel);
    this.modules.set('antiRole', AntiRole);
    this.modules.set('antiGuild', AntiGuild);

    console.log('[SECURITY CORE]'.info, `Loaded ${this.modules.size} protection modules`);
    return true;
  }

  async setupGuild(guildId) {
    try {
      if (this.activeGuilds.has(guildId)) return;

      let settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings) {
        settings = new SecuritySettingsModel({
          guildId,
          enabled: true,
          antiRaid: { enabled: true, joinThreshold: 10, action: 'ban' },
          antiNuke: { enabled: true, deleteThreshold: 3, roleDeleteThreshold: 2, action: 'ban' },
          antiSpam: { enabled: true, messageLimit: 5, timeWindow: 5000, action: 'mute' },
          antiLink: { enabled: true, action: 'delete' },
          antiInvite: { enabled: true, action: 'delete' },
          antiWebhook: { enabled: true, blockAll: false },
          antiBot: { enabled: true, blockAll: false },
          antiChannel: { enabled: false, blockAll: false },
          antiRole: { enabled: false, blockAll: false },
          antiGuild: { enabled: true },
          spamFilter: { enabled: true, messageLimit: 5, timeWindow: 5000 },
          inviteFilter: { enabled: true, allowWhitelisted: true },
          profanityFilter: { enabled: true, action: 'warn' },
        });
        await settings.save();
      }

      this.activeGuilds.add(guildId);
      console.log('[SECURITY CORE]'.info, `Guild ${guildId} security initialized`);

      return settings;
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return null;
    }
  }

  async getSettings(guildId) {
    try {
      let settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings) {
        await this.setupGuild(guildId);
        settings = await SecuritySettingsModel.findOne({ guildId });
      }
      return settings;
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return null;
    }
  }

  async updateSettings(guildId, updates) {
    try {
      const settings = await SecuritySettingsModel.findOneAndUpdate(
        { guildId },
        { ...updates, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      return settings;
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return null;
    }
  }

  async enableModule(guildId, moduleName) {
    try {
      const updateObj = {};
      updateObj[`${moduleName}.enabled`] = true;
      return await this.updateSettings(guildId, updateObj);
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return null;
    }
  }

  async disableModule(guildId, moduleName) {
    try {
      const updateObj = {};
      updateObj[`${moduleName}.enabled`] = false;
      return await this.updateSettings(guildId, updateObj);
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return null;
    }
  }

  async getModuleStatus(guildId) {
    try {
      const settings = await this.getSettings(guildId);
      const status = {};

      for (const [name, module] of this.modules) {
        const configKey = name.charAt(0).toLowerCase() + name.slice(1);
        status[name] = {
          enabled: settings[configKey]?.enabled || false,
          config: settings[configKey],
          module,
        };
      }

      return status;
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return {};
    }
  }

  async performFullSecurityCheck(guildId, userId, username, content = null) {
    try {
      const settings = await this.getSettings(guildId);
      if (!settings?.enabled) return { blocked: false, checks: [] };

      const checks = [];

      // Anti-Spam
      if (settings.antiSpam?.enabled) {
        const spamCheck = await AntiSpam.checkSpam(guildId, userId, username);
        if (spamCheck.blocked) {
          checks.push({ module: 'antiSpam', blocked: true, reason: spamCheck.reason });
          return { blocked: true, checks, action: spamCheck.action };
        }
        checks.push({ module: 'antiSpam', blocked: false });
      }

      if (content) {
        // Anti-Link
        if (settings.antiLink?.enabled) {
          const linkCheck = await AntiLink.checkMessage(guildId, userId, username, content);
          if (linkCheck.blocked) {
            checks.push({ module: 'antiLink', blocked: true, reason: linkCheck.reason });
            return { blocked: true, checks, action: linkCheck.action };
          }
          checks.push({ module: 'antiLink', blocked: false });
        }

        // Anti-Invite
        if (settings.antiInvite?.enabled) {
          const inviteCheck = await AntiInvite.checkMessage(guildId, userId, username, content);
          if (inviteCheck.blocked) {
            checks.push({ module: 'antiInvite', blocked: true, reason: inviteCheck.reason });
            return { blocked: true, checks, action: inviteCheck.action };
          }
          checks.push({ module: 'antiInvite', blocked: false });
        }
      }

      return { blocked: false, checks };
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return { blocked: false, error: error.message };
    }
  }

  async getSecurityStatus(guildId) {
    try {
      const settings = await this.getSettings(guildId);
      const moduleStatus = await this.getModuleStatus(guildId);
      const recentLogs = await AuditLogger.getAuditLogs(guildId, { limit: 50 });
      const whitelistCount = (await this.whitelist.getGuildWhitelist(guildId)).length;
      const blacklistCount = (await this.blacklist.getGuildBlacklist(guildId)).length;
      const backups = await this.backup.getBackups(guildId);

      return {
        guildId,
        enabled: settings?.enabled,
        modules: moduleStatus,
        statistics: {
          whitelisted: whitelistCount,
          blacklisted: blacklistCount,
          totalLogs: recentLogs.total,
          backups: backups.data?.length || 0,
          criticalIncidents: recentLogs.data?.filter(l => l.severity === 'critical').length || 0,
        },
        recentLogs: recentLogs.data?.slice(0, 10),
      };
    } catch (error) {
      console.error('[SECURITY CORE]'.error, error);
      return null;
    }
  }
}

export default new SecurityCore();
