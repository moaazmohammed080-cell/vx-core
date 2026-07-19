import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiChannel {
  async trackChannelCreate(guildId, userId, channelName) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiChannel?.enabled) return { blocked: false };

      if (settings.antiChannel?.blockAll) {
        await AuditLogger.log(guildId, userId, 'channel_created', {
          actionType: 'security',
          severity: 'warning',
          targetName: channelName,
          reason: 'Channel created',
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Channel creation not allowed',
          action: 'delete',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-CHANNEL ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiChannel();
