import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { logToChannel } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to kick')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Kick reason')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'User not found')],
        ephemeral: true,
      });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot kick yourself')],
        ephemeral: true,
      });
    }

    if (target.id === interaction.client.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot kick the bot')],
        ephemeral: true,
      });
    }

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'User is not a member of this server')],
        ephemeral: true,
      });
    }

    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot kick someone with a higher role')],
        ephemeral: true,
      });
    }

    try {
      await targetMember.kick(reason);

      await logToChannel(interaction.guild, 'kick', {
        user: target,
        moderator: interaction.user,
        reason: reason,
      });

      const successEmbed = createSuccessEmbed(
        'Member Kicked',
        `${target} has been kicked from the server.\n\n**Reason:** ${reason}`
      );

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[KICK ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to kick user')],
        ephemeral: true,
      });
    }
  },
};
