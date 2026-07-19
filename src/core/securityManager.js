export class SecurityManager {
  constructor() {
    this.violations = new Map();
    this.suspiciousUsers = new Set();
    this.trustedGuilds = new Set();
  }

  recordViolation(userId, guildId, type, severity = 'medium') {
    const key = `${userId}-${guildId}`;
    
    if (!this.violations.has(key)) {
      this.violations.set(key, []);
    }

    this.violations.get(key).push({
      type,
      severity,
      timestamp: Date.now(),
    });

    return this.getViolationCount(userId, guildId);
  }

  getViolationCount(userId, guildId) {
    const key = `${userId}-${guildId}`;
    return this.violations.has(key) ? this.violations.get(key).length : 0;
  }

  getViolations(userId, guildId) {
    const key = `${userId}-${guildId}`;
    return this.violations.get(key) || [];
  }

  clearViolations(userId, guildId) {
    const key = `${userId}-${guildId}`;
    this.violations.delete(key);
  }

  markSuspicious(userId) {
    this.suspiciousUsers.add(userId);
  }

  isSuspicious(userId) {
    return this.suspiciousUsers.has(userId);
  }

  removeSuspicious(userId) {
    this.suspiciousUsers.delete(userId);
  }

  trustGuild(guildId) {
    this.trustedGuilds.add(guildId);
  }

  isTrusted(guildId) {
    return this.trustedGuilds.has(guildId);
  }

  untrustGuild(guildId) {
    this.trustedGuilds.delete(guildId);
  }
}

export const securityManager = new SecurityManager();
