import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../config/constants.js';
import { Guild } from '../database/models/Guild.js';

export const logToChannel = async (guild, logType, data) => {
  try {
    const guildConfig = await Guild.findOne({ guildId: guild.id });
    
    if (!guildConfig || !guildConfig.loggingConfig.enabled) {
      return;
    }

    const logChannel = guild.channels.cache.get(guildConfig.loggingConfig.channelId);
    if (!logChannel) return;

    let embed;

    switch (logType) {
      case 'memberJoin':
        if (!guildConfig.loggingConfig.logEvents.memberJoin) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.MEMBER} Member Joined`)
          .setDescription(`${data.user} (${data.user.id})`)
          .setThumbnail(data.user.displayAvatarURL())
          .setColor(COLORS.SUCCESS)
          .setTimestamp();
        break;

      case 'memberLeave':
        if (!guildConfig.loggingConfig.logEvents.memberLeave) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.MEMBER} Member Left`)
          .setDescription(`${data.user.username} (${data.user.id})`)
          .setColor(COLORS.WARNING)
          .setTimestamp();
        break;

      case 'messageDelete':
        if (!guildConfig.loggingConfig.logEvents.messageDelete) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.LOCK} Message Deleted`)
          .addFields(
            { name: 'Author', value: `${data.author}`, inline: true },
            { name: 'Channel', value: data.channel.toString(), inline: true },
            { name: 'Content', value: data.content || 'No content', inline: false }
          )
          .setColor(COLORS.ERROR)
          .setTimestamp();
        break;

      case 'kick':
        if (!guildConfig.loggingConfig.logEvents.kick) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.WARNING} Member Kicked`)
          .addFields(
            { name: 'User', value: `${data.user}`, inline: true },
            { name: 'Moderator', value: `${data.moderator}`, inline: true },
            { name: 'Reason', value: data.reason || 'No reason provided', inline: false }
          )
          .setColor(COLORS.WARNING)
          .setTimestamp();
        break;

      case 'ban':
        if (!guildConfig.loggingConfig.logEvents.ban) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.ERROR} Member Banned`)
          .addFields(
            { name: 'User', value: `${data.user}`, inline: true },
            { name: 'Moderator', value: `${data.moderator}`, inline: true },
            { name: 'Reason', value: data.reason || 'No reason provided', inline: false }
          )
          .setColor(COLORS.ERROR)
          .setTimestamp();
        break;

      case 'timeout':
        if (!guildConfig.loggingConfig.logEvents.timeout) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.LOCK} Member Timed Out`)
          .addFields(
            { name: 'User', value: `${data.user}`, inline: true },
            { name: 'Moderator', value: `${data.moderator}`, inline: true },
            { name: 'Duration', value: data.duration, inline: true },
            { name: 'Reason', value: data.reason || 'No reason provided', inline: false }
          )
          .setColor(COLORS.WARNING)
          .setTimestamp();
        break;

      case 'warn':
        if (!guildConfig.loggingConfig.logEvents.warn) return;
        embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.WARNING} Member Warned`)
          .addFields(
            { name: 'User', value: `${data.user}`, inline: true },
            { name: 'Moderator', value: `${data.moderator}`, inline: true },
            { name: 'Total Warnings', value: `${data.warnings}`, inline: true },
            { name: 'Reason', value: data.reason || 'No reason provided', inline: false }
          )
          .setColor(COLORS.WARNING)
          .setTimestamp();
        break;

      default:
        return;
    }

    if (embed) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[LOGGER ERROR]'.error, error.message);
  }
};
