export class AntiRole {
  constructor() {
    this.roleActions = new Map();
    this.threshold = 5;
    this.timeWindow = 60000;
  }

  trackRoleAction(guildId, actionType) {
    const key = `${guildId}-${actionType}`;
    if (!this.roleActions.has(key)) {
      this.roleActions.set(key, []);
    }

    const actions = this.roleActions.get(key);
    const now = Date.now();
    const recentActions = actions.filter((action) => now - action < this.timeWindow);
    recentActions.push(now);
    this.roleActions.set(key, recentActions);

    return recentActions.length;
  }

  isRoleNukeDetected(guildId) {
    let totalActions = 0;
    for (const key of this.roleActions.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        totalActions += this.roleActions.get(key).length;
      }
    }
    return totalActions >= this.threshold;
  }

  clearGuild(guildId) {
    for (const key of this.roleActions.keys()) {
      if (key.startsWith(`${guildId}-`)) {
        this.roleActions.delete(key);
      }
    }
  }
}

export const antiRole = new AntiRole();
