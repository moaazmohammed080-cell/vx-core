import { config } from '../config/config.js';
import { Guild } from '../database/models/Guild.js';
import { User } from '../database/models/User.js';
import { logToChannel } from '../utils/logger.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../config/constants.js';

export default {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      await User.findOneAndUpdate(
        { userId: member.id, guildId: member.guild.id },
        {
          $setOnInsert: {
            username: member.user.username,
            avatar: member.displayAvatarURL(),
          },
        },
        { upsert: true }
      );

      const guildConfig = await Guild.findOne({ guildId: member.guild.id });

      if (config.features.autoRole && guildConfig?.autoRoleConfig?.enabled && guildConfig.autoRoleConfig.roleId) {
        try {
          await member.roles.add(guildConfig.autoRoleConfig.roleId);
          console.log('[AUTO ROLE]'.info, `Added auto role to ${member.user.tag}`);
        } catch (error) {
          console.error('[AUTO ROLE ERROR]'.error, error.message);
        }
      }

      if (config.features.verification && guildConfig?.verificationConfig?.enabled && guildConfig.verificationConfig.channelId) {
        const channel = member.guild.channels.cache.get(guildConfig.verificationConfig.channelId);
        if (channel) {
          const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.MEMBER} Welcome to ${member.guild.name}!`)
            .setDescription(`Welcome ${member}, please verify yourself to access the server.`)
            .setColor(COLORS.PRIMARY)
            .setTimestamp();

          const verifyButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('verify')
              .setLabel('Verify')
              .setStyle(ButtonStyle.Success)
              .setEmoji(EMOJIS.SUCCESS)
          );

          await channel.send({
            content: member.toString(),
            embeds: [welcomeEmbed],
            components: [verifyButton],
          });
        }
      }

      await logToChannel(member.guild, 'memberJoin', { user: member.user });
    } catch (error) {
      console.error('[GUILD MEMBER ADD ERROR]'.error, error);
    }
  },
};
