export class AntiSpam {
  constructor() {
    this.messageTracker = new Map();
    this.threshold = 5;
    this.timeWindow = 5000;
  }

  trackMessage(userId, guildId) {
    const key = `${userId}-${guildId}`;
    if (!this.messageTracker.has(key)) {
      this.messageTracker.set(key, []);
    }

    const messages = this.messageTracker.get(key);
    const now = Date.now();
    const recentMessages = messages.filter((msg) => now - msg < this.timeWindow);
    recentMessages.push(now);
    this.messageTracker.set(key, recentMessages);

    return recentMessages.length;
  }

  isSpammer(userId, guildId) {
    const key = `${userId}-${guildId}`;
    const messages = this.messageTracker.get(key) || [];
    return messages.length >= this.threshold;
  }

  clearUser(userId, guildId) {
    const key = `${userId}-${guildId}`;
    this.messageTracker.delete(key);
  }
}

export const antiSpam = new AntiSpam();
