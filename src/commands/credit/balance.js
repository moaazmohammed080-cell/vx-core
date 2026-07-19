import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embeds.js';
import { User } from '../../database/models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your credit balance')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to check balance for')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;

    try {
      const userData = await User.findOne({
        userId: target.id,
        guildId: interaction.guildId,
      });

      const credits = userData?.credits || 0;

      const embed = createInfoEmbed(
        '💰 Credit Balance',
        `${target}'s current balance: **${credits}** credits`
      );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('[BALANCE ERROR]'.error, error);
      return interaction.reply({
        content: 'Failed to check balance',
        ephemeral: true,
      });
    }
  },
};
