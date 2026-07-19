export class AntiBot {
  constructor() {
    this.botTracker = new Map();
    this.threshold = 5;
    this.timeWindow = 60000;
  }

  trackBotJoin(guildId) {
    if (!this.botTracker.has(guildId)) {
      this.botTracker.set(guildId, []);
    }

    const joins = this.botTracker.get(guildId);
    const now = Date.now();
    const recentJoins = joins.filter((join) => now - join < this.timeWindow);
    recentJoins.push(now);
    this.botTracker.set(guildId, recentJoins);

    return recentJoins.length;
  }

  isBotRaidDetected(guildId) {
    const joins = this.botTracker.get(guildId) || [];
    return joins.length >= this.threshold;
  }

  clearGuild(guildId) {
    this.botTracker.delete(guildId);
  }
}

export const antiBot = new AntiBot();
