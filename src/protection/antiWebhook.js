export class AntiWebhook {
  constructor() {
    this.webhookTracker = new Map();
  }

  trackWebhookCreation(guildId) {
    if (!this.webhookTracker.has(guildId)) {
      this.webhookTracker.set(guildId, []);
    }

    const webhooks = this.webhookTracker.get(guildId);
    webhooks.push(Date.now());
    this.webhookTracker.set(guildId, webhooks);

    return webhooks.length;
  }

  getWebhookCount(guildId) {
    return this.webhookTracker.get(guildId)?.length || 0;
  }

  clearGuild(guildId) {
    this.webhookTracker.delete(guildId);
  }
}

export const antiWebhook = new AntiWebhook();
