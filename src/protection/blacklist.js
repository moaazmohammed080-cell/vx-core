export class Blacklist {
  constructor() {
    this.users = new Set();
    this.guilds = new Set();
  }

  addUser(userId) {
    this.users.add(userId);
  }

  removeUser(userId) {
    this.users.delete(userId);
  }

  isUserBlacklisted(userId) {
    return this.users.has(userId);
  }

  addGuild(guildId) {
    this.guilds.add(guildId);
  }

  removeGuild(guildId) {
    this.guilds.delete(guildId);
  }

  isGuildBlacklisted(guildId) {
    return this.guilds.has(guildId);
  }

  getAllUsers() {
    return Array.from(this.users);
  }

  getAllGuilds() {
    return Array.from(this.guilds);
  }
}

export const blacklist = new Blacklist();
