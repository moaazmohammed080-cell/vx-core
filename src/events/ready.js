import { ActivityType } from 'discord.js';
import { config } from '../config/config.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[READY]`.info, `Bot logged in as ${client.user.tag}`);

    client.user.setActivity({
      name: config.bot.activity,
      type: ActivityType.Playing,
    });

    try {
      const guild = await client.guilds.fetch(config.guildId);
      const commands = Array.from(client.commands.values()).map((cmd) => cmd.data);

      await guild.commands.set(commands);
      console.log(`[COMMANDS]`.info, `Registered ${commands.length} slash commands`);
    } catch (error) {
      console.error('[COMMANDS ERROR]'.error, error);
    }
  },
};
