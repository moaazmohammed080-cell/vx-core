import { SlashCommandBuilder } from 'discord.js';
import { createProfileEmbed } from '../../utils/embeds.js';
import { User } from '../../database/models/User.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or another user\'s rank')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to check rank for')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;

    try {
      const userData = await User.findOne({
        userId: target.id,
        guildId: interaction.guildId,
      });

      const level = userData?.level || 1;
      const xp = userData?.xp || 0;
      const totalXp = userData?.totalXp || 0;
      const credits = userData?.credits || 0;
      const warnings = userData?.warnings || 0;

      const embed = createProfileEmbed(target, level, xp, totalXp, credits, warnings);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('[RANK ERROR]'.error, error);
      return interaction.reply({
        content: 'Failed to fetch rank',
        ephemeral: true,
      });
    }
  },
};
