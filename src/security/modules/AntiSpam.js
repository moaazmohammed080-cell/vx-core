import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiSpam {
  constructor() {
    this.userMessages = new Map();
  }

  async checkSpam(guildId, userId, username) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiSpam?.enabled) return { blocked: false };

      const key = `${guildId}:${userId}`;
      if (!this.userMessages.has(key)) {
        this.userMessages.set(key, { count: 0, timestamp: Date.now() });
      }

      const tracker = this.userMessages.get(key);
      tracker.count++;

      const timeWindow = settings.antiSpam?.timeWindow || 5000;
      const messageLimit = settings.antiSpam?.messageLimit || 5;

      if (Date.now() - tracker.timestamp > timeWindow) {
        tracker.count = 1;
        tracker.timestamp = Date.now();
        return { blocked: false };
      }

      if (tracker.count > messageLimit) {
        await AuditLogger.log(guildId, userId, 'spam_detected', {
          actionType: 'security',
          severity: 'warning',
          targetId: userId,
          targetName: username,
          reason: `Spam detected: ${tracker.count} messages in ${timeWindow}ms`,
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Spam detected',
          action: settings.antiSpam?.action || 'mute',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-SPAM ERROR]'.error, error);
      return { blocked: false };
    }
  }

  async clearUserMessages(userId) {
    this.userMessages.delete(userId);
  }
}

export default new AntiSpam();
