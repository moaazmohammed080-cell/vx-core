import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { logToChannel } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Ban reason')
        .setRequired(false)
    )
    .addNumberOption((option) =>
      option
        .setName('delete_days')
        .setDescription('Number of days to delete messages (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getNumber('delete_days') || 0;

    if (!target) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'User not found')],
        ephemeral: true,
      });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot ban yourself')],
        ephemeral: true,
      });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot ban the bot')],
        ephemeral: true,
      });
    }

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (targetMember && targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot ban someone with a higher role')],
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.ban(target.id, {
        deleteMessageDays: deleteDays,
        reason: reason,
      });

      await logToChannel(interaction.guild, 'ban', {
        user: target,
        moderator: interaction.user,
        reason: reason,
      });

      const successEmbed = createSuccessEmbed(
        'Member Banned',
        `${target} has been banned from the server.\n\n**Reason:** ${reason}`
      );

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[BAN ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to ban user')],
        ephemeral: true,
      });
    }
  },
};
