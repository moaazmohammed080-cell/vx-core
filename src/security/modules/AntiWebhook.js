import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiWebhook {
  async trackWebhookCreate(guildId, userId, webhookName) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiWebhook?.enabled) return { blocked: false };

      await AuditLogger.log(guildId, userId, 'webhook_created', {
        actionType: 'security',
        severity: settings.antiWebhook?.blockAll ? 'critical' : 'warning',
        targetName: webhookName,
        reason: 'Webhook created',
        result: 'success',
      });

      if (settings.antiWebhook?.blockAll) {
        return {
          blocked: true,
          reason: 'Webhooks are not allowed',
          action: 'delete',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-WEBHOOK ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiWebhook();
