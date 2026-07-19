import BlacklistModel from '../database/models/BlacklistModel.js';

export class BlacklistSystem {
  async addToBlacklist(guildId, type, addedBy, options = {}) {
    try {
      const blacklist = new BlacklistModel({
        guildId,
        type,
        targetId: options.targetId,
        targetValue: options.targetValue,
        severity: options.severity || 'medium',
        reason: options.reason || 'No reason provided',
        addedBy,
        expiresAt: options.expiresAt,
        action: options.action || 'warn',
        autoAction: options.autoAction !== false,
        metadata: options.metadata,
      });

      await blacklist.save();
      return { success: true, data: blacklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeFromBlacklist(guildId, id) {
    try {
      const result = await BlacklistModel.deleteOne({ _id: id, guildId });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async isBlacklisted(guildId, type, value) {
    try {
      const entry = await BlacklistModel.findOne({
        guildId,
        type,
        $or: [
          { targetId: value },
          { targetValue: value },
        ],
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      });
      return entry ? entry : null;
    } catch (error) {
      return null;
    }
  }

  async getBlacklistEntry(guildId, id) {
    try {
      return await BlacklistModel.findOne({ _id: id, guildId });
    } catch (error) {
      return null;
    }
  }

  async getGuildBlacklist(guildId, type = null, severity = null) {
    try {
      const query = { guildId };
      if (type) query.type = type;
      if (severity) query.severity = severity;
      return await BlacklistModel.find(query).sort({ createdAt: -1 });
    } catch (error) {
      return [];
    }
  }

  async incrementViolations(guildId, id) {
    try {
      const entry = await BlacklistModel.findByIdAndUpdate(
        { _id: id, guildId },
        { $inc: { violations: 1 } },
        { new: true }
      );
      return { success: true, data: entry };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async clearExpiredBlacklist(guildId) {
    try {
      const result = await BlacklistModel.deleteMany({
        guildId,
        expiresAt: { $lt: new Date() },
      });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new BlacklistSystem();
