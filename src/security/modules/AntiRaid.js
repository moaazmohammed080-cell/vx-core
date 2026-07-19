import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiRaid {
  constructor() {
    this.raidThresholds = new Map();
    this.joinTracker = new Map();
  }

  async initialize(guildId) {
    this.raidThresholds.set(guildId, { joins: 0, leaves: 0, timestamp: Date.now() });
  }

  async trackJoin(guildId, userId, username) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiRaid?.enabled) return { blocked: false };

      if (!this.raidThresholds.has(guildId)) {
        await this.initialize(guildId);
      }

      const threshold = this.raidThresholds.get(guildId);
      threshold.joins++;

      if (Date.now() - threshold.timestamp > 10000) {
        threshold.joins = 1;
        threshold.timestamp = Date.now();
      }

      if (threshold.joins > (settings.antiRaid?.joinThreshold || 10)) {
        await AuditLogger.log(guildId, userId, 'raid_detected', {
          actionType: 'security',
          severity: 'critical',
          targetId: userId,
          targetName: username,
          reason: `Raid detected: ${threshold.joins} joins in 10 seconds`,
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Raid detected',
          action: settings.antiRaid?.action || 'ban',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-RAID ERROR]'.error, error);
      return { blocked: false };
    }
  }

  async reset(guildId) {
    this.raidThresholds.delete(guildId);
  }
}

export default new AntiRaid();
