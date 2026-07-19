export class AntiNuke {
  constructor() {
    this.actionTracker = new Map();
    this.threshold = 10;
    this.timeWindow = 60000;
  }

  trackAction(guildId, actionType) {
    const key = `${guildId}-${actionType}`;
    if (!this.actionTracker.has(key)) {
      this.actionTracker.set(key, []);
    }

    const actions = this.actionTracker.get(key);
    const now = Date.now();
    const recentActions = actions.filter((action) => now - action < this.timeWindow);
    recentActions.push(now);
    this.actionTracker.set(key, recentActions);

    return recentActions.length;
  }

  isNukeDetected(guildId, actionType) {
    const key = `${guildId}-${actionType}`;
    const actions = this.actionTracker.get(key) || [];
    return actions.length >= this.threshold;
  }

  clearGuild(guildId) {
    for (const key of this.actionTracker.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        this.actionTracker.delete(key);
      }
    }
  }
}

export const antiNuke = new AntiNuke();
