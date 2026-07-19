export class AntiGuild {
  constructor() {
    this.guildActions = new Map();
    this.threshold = 3;
    this.timeWindow = 60000;
  }

  trackGuildAction(guildId, actionType) {
    const key = `${guildId}-${actionType}`;
    if (!this.guildActions.has(key)) {
      this.guildActions.set(key, []);
    }

    const actions = this.guildActions.get(key);
    const now = Date.now();
    const recentActions = actions.filter((action) => now - action < this.timeWindow);
    recentActions.push(now);
    this.guildActions.set(key, recentActions);

    return recentActions.length;
  }

  isSuspiciousActivity(guildId) {
    let totalActions = 0;
    for (const key of this.guildActions.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        totalActions += this.guildActions.get(key).length;
      }
    }
    return totalActions >= this.threshold;
  }

  clearGuild(guildId) {
    for (const key of this.guildActions.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        this.guildActions.delete(key);
      }
    }
  }
}

export const antiGuild = new AntiGuild();
