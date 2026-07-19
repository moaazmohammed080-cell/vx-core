import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../config/constants.js';

export class Backup {
  constructor() {
    this.backups = new Map();
  }

  createBackup(guildId, data) {
    const backupId = `${guildId}-${Date.now()}`;
    const backup = {
      id: backupId,
      guildId,
      timestamp: Date.now(),
      data: {
        name: data.name,
        icon: data.icon,
        channels: data.channels,
        roles: data.roles,
        members: data.members,
      },
    };

    this.backups.set(backupId, backup);
    return backup;
  }

  getBackup(backupId) {
    return this.backups.get(backupId);
  }

  getGuildBackups(guildId) {
    const backups = [];
    for (const [id, backup] of this.backups.entries()) {
      if (backup.guildId === guildId) {
        backups.push(backup);
      }
    }
    return backups;
  }

  deleteBackup(backupId) {
    return this.backups.delete(backupId);
  }

  deleteGuildBackups(guildId) {
    for (const [id, backup] of this.backups.entries()) {
      if (backup.guildId === guildId) {
        this.backups.delete(id);
      }
    }
  }
}

export const backup = new Backup();
