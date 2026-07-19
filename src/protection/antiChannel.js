export class AntiChannel {
  constructor() {
    this.channelActions = new Map();
    this.threshold = 5;
    this.timeWindow = 60000;
  }

  trackChannelAction(guildId, actionType) {
    const key = `${guildId}-${actionType}`;
    if (!this.channelActions.has(key)) {
      this.channelActions.set(key, []);
    }

    const actions = this.channelActions.get(key);
    const now = Date.now();
    const recentActions = actions.filter((action) => now - action < this.timeWindow);
    recentActions.push(now);
    this.channelActions.set(key, recentActions);

    return recentActions.length;
  }

  isChannelNukeDetected(guildId) {
    let totalActions = 0;
    for (const key of this.channelActions.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        totalActions += this.channelActions.get(key).length;
      }
    }
    return totalActions >= this.threshold;
  }

  clearGuild(guildId) {
    for (const key of this.channelActions.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        this.channelActions.delete(key);
      }
    }
  }
}

export const antiChannel = new AntiChannel();
