import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import WhitelistSystem from '../WhitelistSystem.js';
import AuditLogger from '../AuditLogger.js';

export class AntiInvite {
  async checkMessage(guildId, userId, username, content) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiInvite?.enabled) return { blocked: false };

      const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/([a-zA-Z0-9-]+)/gi;
      if (inviteRegex.test(content)) {
        const isWhitelisted = await WhitelistSystem.isWhitelisted(
          guildId,
          'invite',
          userId
        );

        if (!isWhitelisted) {
          await AuditLogger.log(guildId, userId, 'invite_detected', {
            actionType: 'security',
            severity: 'warning',
            targetId: userId,
            targetName: username,
            reason: 'Invite link posted',
            result: 'success',
          });

          return {
            blocked: true,
            reason: 'Invites not allowed',
            action: settings.antiInvite?.action || 'delete',
          };
        }
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-INVITE ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiInvite();
