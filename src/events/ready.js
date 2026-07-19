import SecurityCore from '../security/SecurityCore.js';
import { config } from '../config/config.js';

export const event = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[BOT]`.info, `Logged in as ${client.user.tag}`);
    console.log(`[BOT]`.info, `Serving ${client.guilds.cache.size} guild(s)`);

    if (config.features.securityCore) {
      for (const guild of client.guilds.cache.values()) {
        await SecurityCore.setupGuild(guild.id);
      }
      console.log(`[SECURITY CORE]`.info, `Security initialized for ${client.guilds.cache.size} guild(s)`);
    }

    client.user.setActivity(config.bot.activity, { type: 'WATCHING' });
  },
};
