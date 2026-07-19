import { Guild } from '../database/models/Guild.js';
import { logToChannel } from '../utils/logger.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../config/constants.js';

export default {
  name: 'guildMemberRemove',
  async execute(member, client) {
    try {
      const guildConfig = await Guild.findOne({ guildId: member.guild.id });

      if (guildConfig?.leaveConfig?.enabled && guildConfig.leaveConfig.channelId) {
        const channel = member.guild.channels.cache.get(guildConfig.leaveConfig.channelId);
        if (channel) {
          const leaveEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.MEMBER} Member Left`)
            .setDescription(`${member.user.username} has left the server.`)
            .setThumbnail(member.displayAvatarURL())
            .setColor(COLORS.WARNING)
            .setTimestamp();

          await channel.send({ embeds: [leaveEmbed] });
        }
      }

      await logToChannel(member.guild, 'memberLeave', { user: member.user });
    } catch (error) {
      console.error('[GUILD MEMBER REMOVE ERROR]'.error, error);
    }
  },
};
