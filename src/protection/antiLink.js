export class AntiLink {
  constructor() {
    this.linkPatterns = [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    ];
    this.whitelist = new Set();
  }

  containsLink(message) {
    return this.linkPatterns.some((pattern) => pattern.test(message));
  }

  whitelistLink(link) {
    this.whitelist.add(link);
  }

  removeWhitelistedLink(link) {
    this.whitelist.delete(link);
  }

  isWhitelisted(message) {
    for (const link of this.whitelist) {
      if (message.includes(link)) {
        return true;
      }
    }
    return false;
  }
}

export const antiLink = new AntiLink();
