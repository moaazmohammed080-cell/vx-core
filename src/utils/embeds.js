import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../config/constants.js';

export const createSuccessEmbed = (title, description) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.SUCCESS} ${title}`)
    .setDescription(description)
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
};

export const createErrorEmbed = (title, description) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.ERROR} ${title}`)
    .setDescription(description)
    .setColor(COLORS.ERROR)
    .setTimestamp();
};

export const createWarningEmbed = (title, description) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.WARNING} ${title}`)
    .setDescription(description)
    .setColor(COLORS.WARNING)
    .setTimestamp();
};

export const createInfoEmbed = (title, description) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.INFO} ${title}`)
    .setDescription(description)
    .setColor(COLORS.INFO)
    .setTimestamp();
};

export const createTicketEmbed = (user, subject, description) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.TICKET} Support Ticket`)
    .setDescription(description || 'No description provided')
    .addFields(
      { name: 'User', value: `${user}`, inline: true },
      { name: 'Subject', value: subject, inline: true },
      { name: 'Status', value: 'Open', inline: true }
    )
    .setColor(COLORS.PRIMARY)
    .setTimestamp();
};

export const createGiveawayEmbed = (prize, winnerCount, endTime) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.GIFT} GIVEAWAY`)
    .setDescription(`**Prize:** ${prize}`)
    .addFields(
      { name: 'Winners', value: `${winnerCount}`, inline: true },
      { name: 'Ends', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true }
    )
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
};

export const createLevelUpEmbed = (user, level, totalXp) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.STAR} Level Up!`)
    .setDescription(`Congratulations ${user}!`)
    .addFields(
      { name: 'New Level', value: `${level}`, inline: true },
      { name: 'Total XP', value: `${totalXp}`, inline: true }
    )
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
};

export const createProfileEmbed = (user, level, xp, totalXp, credits, warnings) => {
  return new EmbedBuilder()
    .setTitle(`${EMOJIS.MEMBER} ${user.username}'s Profile`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: 'Level', value: `${level}`, inline: true },
      { name: 'XP', value: `${xp}`, inline: true },
      { name: 'Total XP', value: `${totalXp}`, inline: true },
      { name: 'Credits', value: `${EMOJIS.COINS} ${credits}`, inline: true },
      { name: 'Warnings', value: `${warnings}`, inline: true }
    )
    .setColor(COLORS.PRIMARY)
    .setTimestamp();
};
