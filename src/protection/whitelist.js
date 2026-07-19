export class Whitelist {
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

  isUserWhitelisted(userId) {
    return this.users.has(userId);
  }

  addGuild(guildId) {
    this.guilds.add(guildId);
  }

  removeGuild(guildId) {
    this.guilds.delete(guildId);
  }

  isGuildWhitelisted(guildId) {
    return this.guilds.has(guildId);
  }

  getAllUsers() {
    return Array.from(this.users);
  }

  getAllGuilds() {
    return Array.from(this.guilds);
  }
}

export const whitelist = new Whitelist();
