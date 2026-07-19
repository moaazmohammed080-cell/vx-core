import SecurityCore from '../security/SecurityCore.js';
import { config } from '../config/config.js';

export const event = {
  name: 'guildCreate',
  async execute(guild, client) {
    console.log(`[GUILD]`.info, `Bot added to guild: ${guild.name} (${guild.id})`);

    if (config.features.securityCore) {
      await SecurityCore.setupGuild(guild.id);
      console.log(`[SECURITY CORE]`.info, `Security initialized for ${guild.name}`);
    }
  },
};
