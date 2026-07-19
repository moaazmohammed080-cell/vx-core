import WhitelistModel from '../database/models/WhitelistModel.js';

export class WhitelistSystem {
  async addToWhitelist(guildId, type, targetId, addedBy, options = {}) {
    try {
      const whitelist = new WhitelistModel({
        guildId,
        type,
        targetId,
        addedBy,
        targetName: options.targetName,
        reason: options.reason,
        expiresAt: options.expiresAt,
        permissions: options.permissions || [],
        metadata: options.metadata,
      });

      await whitelist.save();
      return { success: true, data: whitelist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeFromWhitelist(guildId, type, targetId) {
    try {
      const result = await WhitelistModel.deleteOne({ guildId, type, targetId });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async isWhitelisted(guildId, type, targetId) {
    try {
      const entry = await WhitelistModel.findOne({
        guildId,
        type,
        targetId,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      });
      return entry ? true : false;
    } catch (error) {
      return false;
    }
  }

  async getWhitelistEntry(guildId, type, targetId) {
    try {
      return await WhitelistModel.findOne({ guildId, type, targetId });
    } catch (error) {
      return null;
    }
  }

  async getGuildWhitelist(guildId, type = null) {
    try {
      const query = { guildId };
      if (type) query.type = type;
      return await WhitelistModel.find(query);
    } catch (error) {
      return [];
    }
  }

  async clearExpiredWhitelist(guildId) {
    try {
      const result = await WhitelistModel.deleteMany({
        guildId,
        expiresAt: { $lt: new Date() },
      });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new WhitelistSystem();
