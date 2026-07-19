import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiNuke {
  constructor() {
    this.actionTracker = new Map();
  }

  async trackChannelDelete(guildId, userId, channelName) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiNuke?.enabled) return { blocked: false };

      const key = `${guildId}:${userId}`;
      if (!this.actionTracker.has(key)) {
        this.actionTracker.set(key, { count: 0, timestamp: Date.now() });
      }

      const tracker = this.actionTracker.get(key);
      tracker.count++;

      if (Date.now() - tracker.timestamp > 30000) {
        tracker.count = 1;
        tracker.timestamp = Date.now();
      }

      if (tracker.count > (settings.antiNuke?.deleteThreshold || 3)) {
        await AuditLogger.log(guildId, userId, 'nuke_detected', {
          actionType: 'security',
          severity: 'critical',
          targetName: channelName,
          reason: `Nuke detected: ${tracker.count} channels deleted in 30 seconds`,
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Nuke detected',
          action: settings.antiNuke?.action || 'ban',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-NUKE ERROR]'.error, error);
      return { blocked: false };
    }
  }

  async trackRoleDelete(guildId, userId, roleName) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiNuke?.enabled) return { blocked: false };

      const key = `${guildId}:${userId}:roles`;
      if (!this.actionTracker.has(key)) {
        this.actionTracker.set(key, { count: 0, timestamp: Date.now() });
      }

      const tracker = this.actionTracker.get(key);
      tracker.count++;

      if (Date.now() - tracker.timestamp > 30000) {
        tracker.count = 1;
        tracker.timestamp = Date.now();
      }

      if (tracker.count > (settings.antiNuke?.roleDeleteThreshold || 2)) {
        await AuditLogger.log(guildId, userId, 'role_nuke_detected', {
          actionType: 'security',
          severity: 'critical',
          targetName: roleName,
          reason: `Role nuke detected: ${tracker.count} roles deleted in 30 seconds`,
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Role nuke detected',
          action: settings.antiNuke?.action || 'ban',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-NUKE ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiNuke();
