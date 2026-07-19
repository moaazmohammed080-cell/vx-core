import AuditLogModel from '../database/models/AuditLogModel.js';

export class AuditLogger {
  async log(guildId, userId, action, options = {}) {
    try {
      const auditLog = new AuditLogModel({
        guildId,
        userId,
        action,
        userName: options.userName,
        userAvatar: options.userAvatar,
        actionType: options.actionType || 'system',
        severity: options.severity || 'info',
        targetId: options.targetId,
        targetName: options.targetName,
        reason: options.reason,
        changes: options.changes,
        result: options.result || 'success',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: options.metadata,
      });

      await auditLog.save();
      return { success: true, data: auditLog };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAuditLogs(guildId, options = {}) {
    try {
      const query = { guildId };
      if (options.userId) query.userId = options.userId;
      if (options.actionType) query.actionType = options.actionType;
      if (options.severity) query.severity = options.severity;
      if (options.startDate || options.endDate) {
        query.timestamp = {};
        if (options.startDate) query.timestamp.$gte = options.startDate;
        if (options.endDate) query.timestamp.$lte = options.endDate;
      }

      const limit = options.limit || 50;
      const skip = options.skip || 0;

      const logs = await AuditLogModel.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);

      const total = await AuditLogModel.countDocuments(query);

      return { success: true, data: logs, total, page: Math.ceil((skip + limit) / limit) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserActivityLog(guildId, userId, limit = 50) {
    try {
      const logs = await AuditLogModel.find({ guildId, userId })
        .sort({ timestamp: -1 })
        .limit(limit);
      return { success: true, data: logs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getActionLog(guildId, action, limit = 50) {
    try {
      const logs = await AuditLogModel.find({ guildId, action })
        .sort({ timestamp: -1 })
        .limit(limit);
      return { success: true, data: logs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSecurityIncidents(guildId, severity = 'critical') {
    try {
      const logs = await AuditLogModel.find({
        guildId,
        severity: { $in: severity ? [severity] : ['critical', 'warning'] },
      }).sort({ timestamp: -1 });
      return { success: true, data: logs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteOldLogs(guildId, daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const result = await AuditLogModel.deleteMany({
        guildId,
        timestamp: { $lt: cutoffDate },
      });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuditLogger();
