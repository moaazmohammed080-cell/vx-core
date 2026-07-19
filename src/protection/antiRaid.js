export class AntiRaid {
  constructor() {
    this.joinTracker = new Map();
    this.threshold = 5;
    this.timeWindow = 10000;
  }

  trackJoin(userId, guildId) {
    const key = `${guildId}`;
    if (!this.joinTracker.has(key)) {
      this.joinTracker.set(key, []);
    }

    const joins = this.joinTracker.get(key);
    const now = Date.now();
    const recentJoins = joins.filter((join) => now - join < this.timeWindow);
    recentJoins.push(now);
    this.joinTracker.set(key, recentJoins);

    return recentJoins.length >= this.threshold;
  }

  isRaidDetected(guildId) {
    const key = `${guildId}`;
    const joins = this.joinTracker.get(key) || [];
    return joins.length >= this.threshold;
  }

  clearGuild(guildId) {
    this.joinTracker.delete(guildId);
  }
}

export const antiRaid = new AntiRaid();
