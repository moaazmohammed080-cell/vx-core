import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { User } from '../../database/models/User.js';
import { isValidCreditAmount } from '../../utils/validators.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addcredit')
    .setDescription('Add credits to a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to add credits to')
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount of credits to add')
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
          $inc: { credits: amount },
          $setOnInsert: { username: target.username, avatar: target.displayAvatarURL() },
        },
        { upsert: true, new: true }
      );

      const successEmbed = createSuccessEmbed(
        'Credits Added',
        `Added **${amount}** credits to ${target}\n\nNew Balance: **${userData.credits}**`
      );

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[ADD CREDIT ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to add credits')],
        ephemeral: true,
      });
    }
  },
};
