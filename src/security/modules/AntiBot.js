import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiBot {
  async trackBotAdd(guildId, userId, botName, botId) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiBot?.enabled) return { blocked: false };

      await AuditLogger.log(guildId, userId, 'bot_added', {
        actionType: 'security',
        severity: settings.antiBot?.blockAll ? 'critical' : 'warning',
        targetId: botId,
        targetName: botName,
        reason: 'Bot added to server',
        result: 'success',
      });

      if (settings.antiBot?.blockAll) {
        return {
          blocked: true,
          reason: 'Bot additions are not allowed',
          action: 'remove',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-BOT ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiBot();
