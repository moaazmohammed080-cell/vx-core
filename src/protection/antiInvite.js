export class AntiInvite {
  constructor() {
    this.invitePattern = /discord\.gg\/[a-z0-9]+/gi;
    this.whitelist = new Set();
  }

  containsInvite(message) {
    return this.invitePattern.test(message);
  }

  whitelistInvite(invite) {
    this.whitelist.add(invite.toLowerCase());
  }

  removeWhitelistedInvite(invite) {
    this.whitelist.delete(invite.toLowerCase());
  }

  isWhitelisted(message) {
    const invites = message.match(this.invitePattern) || [];
    return invites.every((invite) => this.whitelist.has(invite.toLowerCase()));
  }
}

export const antiInvite = new AntiInvite();
