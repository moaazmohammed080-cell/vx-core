import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { logToChannel } from '../../utils/logger.js';
import { User } from '../../database/models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to warn')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Warn reason')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You cannot warn yourself')],
        ephemeral: true,
      });
    }

    try {
      const userData = await User.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guildId },
        {
          $inc: { warnings: 1 },
          $setOnInsert: { username: target.username, avatar: target.displayAvatarURL() },
        },
        { upsert: true, new: true }
      );

      await logToChannel(interaction.guild, 'warn', {
        user: target,
        moderator: interaction.user,
        warnings: userData.warnings,
        reason: reason,
      });

      const successEmbed = createSuccessEmbed(
        'Member Warned',
        `${target} has been warned.\n\n**Reason:** ${reason}\n**Total Warnings:** ${userData.warnings}`
      );

      await interaction.reply({ embeds: [successEmbed] });

      if (userData.warnings === 3) {
        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (targetMember) {
          await targetMember.timeout(3600000, 'Automatic timeout: 3 warnings');
        }
      }
    } catch (error) {
      console.error('[WARN ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to warn user')],
        ephemeral: true,
      });
    }
  },
};
