import SecuritySettingsModel from '../database/models/SecuritySettingsModel.js';
import WhitelistSystem from './WhitelistSystem.js';
import BlacklistSystem from './BlacklistSystem.js';
import AuditLogger from './AuditLogger.js';

export class SecurityManager {
  constructor() {
    this.whitelist = WhitelistSystem;
    this.blacklist = BlacklistSystem;
    this.auditLogger = AuditLogger;
  }

  async getSecuritySettings(guildId) {
    try {
      let settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings) {
        settings = new SecuritySettingsModel({ guildId });
        await settings.save();
      }
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateSecuritySettings(guildId, updates) {
    try {
      let settings = await SecuritySettingsModel.findOneAndUpdate(
        { guildId },
        { ...updates, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async enableSecurity(guildId) {
    return this.updateSecuritySettings(guildId, { enabled: true });
  }

  async disableSecurity(guildId) {
    return this.updateSecuritySettings(guildId, { enabled: false });
  }

  async setWhitelistMode(guildId, enabled) {
    return this.updateSecuritySettings(guildId, { whitelistMode: enabled });
  }

  async setBlacklistMode(guildId, enabled) {
    return this.updateSecuritySettings(guildId, { blacklistMode: enabled });
  }

  async setAutoModeration(guildId, enabled) {
    return this.updateSecuritySettings(guildId, { autoModeration: enabled });
  }

  async addAdminRole(guildId, roleId) {
    try {
      const settings = await SecuritySettingsModel.findOneAndUpdate(
        { guildId },
        { $addToSet: { adminRoles: roleId } },
        { new: true, upsert: true }
      );
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeAdminRole(guildId, roleId) {
    try {
      const settings = await SecuritySettingsModel.findOneAndUpdate(
        { guildId },
        { $pull: { adminRoles: roleId } },
        { new: true }
      );
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addModRole(guildId, roleId) {
    try {
      const settings = await SecuritySettingsModel.findOneAndUpdate(
        { guildId },
        { $addToSet: { modRoles: roleId } },
        { new: true, upsert: true }
      );
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeModRole(guildId, roleId) {
    try {
      const settings = await SecuritySettingsModel.findOneAndUpdate(
        { guildId },
        { $pull: { modRoles: roleId } },
        { new: true }
      );
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setSecurityLogChannel(guildId, channelId) {
    return this.updateSecuritySettings(guildId, { securityLogChannel: channelId });
  }

  async performSecurityCheck(guildId, userId, type, value) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings || !settings.enabled) return { blocked: false };

      // Check whitelist
      if (settings.whitelistMode) {
        const isWhitelisted = await this.whitelist.isWhitelisted(guildId, type, value);
        return { blocked: !isWhitelisted, reason: 'Not in whitelist', type: 'whitelist' };
      }

      // Check blacklist
      if (settings.blacklistMode) {
        const blacklisted = await this.blacklist.isBlacklisted(guildId, type, value);
        if (blacklisted) {
          if (settings.autoModeration) {
            await this.auditLogger.log(guildId, userId, `blocked_${type}`, {
              actionType: 'security',
              severity: blacklisted.severity,
              targetId: value,
              reason: blacklisted.reason,
              result: 'success',
            });
          }
          return { blocked: true, reason: blacklisted.reason, severity: blacklisted.severity };
        }
      }

      return { blocked: false };
    } catch (error) {
      return { blocked: false, error: error.message };
    }
  }

  async getSecurityReport(guildId, options = {}) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      const whitelisted = await this.whitelist.getGuildWhitelist(guildId);
      const blacklisted = await this.blacklist.getGuildBlacklist(guildId);
      const logs = await this.auditLogger.getAuditLogs(guildId, { limit: 100 });

      return {
        success: true,
        data: {
          settings,
          statistics: {
            whitelistCount: whitelisted.length,
            blacklistCount: blacklisted.length,
            totalLogs: logs.total,
            recentViolations: logs.data.filter(l => l.severity === 'critical').length,
          },
          whitelist: whitelisted,
          blacklist: blacklisted,
          recentLogs: logs.data.slice(0, 20),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new SecurityManager();
