import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { logToChannel } from '../../utils/logger.js';
import { User } from '../../database/models/User.js';

const TIMEOUT_DURATIONS = {
  '1m': 60000,
  '5m': 300000,
  '10m': 600000,
  '1h': 3600000,
  '1d': 86400000,
  '1w': 604800000,
};

export default {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to timeout')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Timeout duration')
        .setRequired(true)
        .addChoices(
          { name: '1 Minute', value: '1m' },
          { name: '5 Minutes', value: '5m' },
          { name: '10 Minutes', value: '10m' },
          { name: '1 Hour', value: '1h' },
          { name: '1 Day', value: '1d' },
          { name: '1 Week', value: '1w' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Timeout reason')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const duration = TIMEOUT_DURATIONS[interaction.options.getString('duration')];
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot timeout yourself')],
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
        embeds: [createErrorEmbed('Error', 'You cannot timeout someone with a higher role')],
        ephemeral: true,
      });
    }

    try {
      await targetMember.timeout(duration, reason);

      const durationStr = interaction.options.getString('duration');
      await User.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guildId },
        {
          $push: {
            timeouts: {
              moderator: interaction.user.id,
              reason: reason,
              duration: durationStr,
              timestamp: new Date(),
            },
          },
        },
        { upsert: true }
      );

      await logToChannel(interaction.guild, 'timeout', {
        user: target,
        moderator: interaction.user,
        duration: durationStr,
        reason: reason,
      });

      const successEmbed = createSuccessEmbed(
        'Member Timed Out',
        `${target} has been timed out for ${durationStr}.\n\n**Reason:** ${reason}`
      );

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[TIMEOUT ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to timeout user')],
        ephemeral: true,
      });
    }
  },
};
