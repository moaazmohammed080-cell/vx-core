import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiGuild {
  async trackGuildSettingsChange(guildId, userId, change, oldValue, newValue) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiGuild?.enabled) return { blocked: false };

      await AuditLogger.log(guildId, userId, 'guild_setting_changed', {
        actionType: 'security',
        severity: 'info',
        reason: `Guild setting changed: ${change}`,
        changes: {
          setting: change,
          oldValue: String(oldValue),
          newValue: String(newValue),
        },
        result: 'success',
      });

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-GUILD ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiGuild();
