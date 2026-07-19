import SecuritySettingsModel from '../../database/models/SecuritySettingsModel.js';
import AuditLogger from '../AuditLogger.js';

export class AntiRole {
  async trackRoleCreate(guildId, userId, roleName) {
    try {
      const settings = await SecuritySettingsModel.findOne({ guildId });
      if (!settings?.antiRole?.enabled) return { blocked: false };

      if (settings.antiRole?.blockAll) {
        await AuditLogger.log(guildId, userId, 'role_created', {
          actionType: 'security',
          severity: 'warning',
          targetName: roleName,
          reason: 'Role created',
          result: 'success',
        });

        return {
          blocked: true,
          reason: 'Role creation not allowed',
          action: 'delete',
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('[ANTI-ROLE ERROR]'.error, error);
      return { blocked: false };
    }
  }
}

export default new AntiRole();
