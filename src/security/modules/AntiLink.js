import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiLink {
  async checkMessage(guildId, userId, username, content) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiLink?.enabled) return { blocked: false };

      const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
      if (linkRegex.test(content)) {
        await AuditLogger.log(guildId, userId, 'link_detected', {
          actionType: 'security',
          severity: 'info',
          targetId: userId,
          targetName: username,
          reason: 'Link posted in message',
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Links not allowed',
          action: settings.antiLink?.action || 'delete',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-LINK ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiLink();
