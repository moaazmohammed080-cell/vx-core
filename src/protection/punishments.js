export class Punishments {
  constructor() {
    this.punishments = new Map();
  }

  addPunishment(userId, guildId, type, reason, duration = null) {
    const key = `${userId}-${guildId}`;
    if (!this.punishments.has(key)) {
      this.punishments.set(key, []);
    }

    const punishmentRecord = {
      type,
      reason,
      duration,
      timestamp: Date.now(),
    };

    this.punishments.get(key).push(punishmentRecord);
    return punishmentRecord;
  }

  getPunishments(userId, guildId) {
    const key = `${userId}-${guildId}`;
    return this.punishments.get(key) || [];
  }

  removePunishment(userId, guildId, index) {
    const key = `${userId}-${guildId}`;
    if (this.punishments.has(key)) {
      this.punishments.get(key).splice(index, 1);
    }
  }

  clearPunishments(userId, guildId) {
    const key = `${userId}-${guildId}`;
    this.punishments.delete(key);
  }
}

export const punishments = new Punishments();
