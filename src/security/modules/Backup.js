import mongoose from 'mongoose';
import AuditLogger from '../AuditLogger.js';

const backupSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  data: {
    roles: [{
      id: String,
      name: String,
      color: Number,
      permissions: String,
      position: Number,
    }],
    channels: [{
      id: String,
      name: String,
      type: String,
      position: Number,
      parent: String,
      permissions: Array,
    }],
    settings: {
      name: String,
      icon: String,
      banner: String,
      description: String,
    },
  },
  metadata: { type: Map, of: String },
});

const BackupModel = mongoose.model('Backup', backupSchema);

export class Backup {
  async createBackup(guildId, guild, createdBy, backupName = null) {
    try {
      const roles = guild.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.color,
        permissions: role.permissions.bitfield.toString(),
        position: role.position,
      }));

      const channels = guild.channels.cache.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parent: channel.parent?.id || null,
        permissions: channel.permissionOverwrites.cache.map(perm => ({
          id: perm.id,
          type: perm.type,
          allow: perm.allow.bitfield.toString(),
          deny: perm.deny.bitfield.toString(),
        })),
      }));

      const backup = new BackupModel({
        guildId,
        name: backupName || `Backup ${new Date().toLocaleString()}`,
        createdBy,
        data: {
          roles,
          channels,
          settings: {
            name: guild.name,
            icon: guild.iconURL(),
            banner: guild.bannerURL(),
            description: guild.description,
          },
        },
      });

      await backup.save();

      await AuditLogger.log(guildId, createdBy, 'backup_created', {
        actionType: 'admin',
        severity: 'info',
        targetName: backup.name,
        reason: 'Server backup created',
        result: 'success',
      });

      return { success: true, data: backup };
    } catch (error) {
      console.error('[BACKUP ERROR]'.error, error);
      return { success: false, error: error.message };
    }
  }

  async getBackups(guildId) {
    try {
      const backups = await BackupModel.find({ guildId }).sort({ createdAt: -1 });
      return { success: true, data: backups };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteBackup(guildId, backupId) {
    try {
      const result = await BackupModel.deleteOne({ _id: backupId, guildId });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new Backup();
