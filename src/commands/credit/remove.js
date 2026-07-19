import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { User } from '../../database/models/User.js';
import { isValidCreditAmount } from '../../utils/validators.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removecredit')
    .setDescription('Remove credits from a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to remove credits from')
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount of credits to remove')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    if (!isValidCreditAmount(amount)) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Invalid credit amount')],
        ephemeral: true,
      });
    }

    try {
      const userData = await User.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guildId },
        {
          $inc: { credits: -amount },
          $setOnInsert: { username: target.username, avatar: target.displayAvatarURL() },
        },
        { upsert: true, new: true }
      );

      if (userData.credits < 0) {
        userData.credits = 0;
        await userData.save();
      }

      const successEmbed = createSuccessEmbed(
        'Credits Removed',
        `Removed **${amount}** credits from ${target}\n\nNew Balance: **${userData.credits}**`
      );

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[REMOVE CREDIT ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to remove credits')],
        ephemeral: true,
      });
    }
  },
};
