import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { Giveaway } from '../../database/models/Giveaway.js';

export default {
  data: new SlashCommandBuilder()
    .setName('endgiveaway')
    .setDescription('End a giveaway early')
    .addStringOption((option) =>
      option
        .setName('giveaway_id')
        .setDescription('ID of the giveaway to end')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const giveawayId = interaction.options.getString('giveaway_id');

    try {
      const giveaway = await Giveaway.findOne({ giveawayId, guildId: interaction.guildId });

      if (!giveaway) {
        return interaction.reply({
          embeds: [createErrorEmbed('Error', 'Giveaway not found')],
          ephemeral: true,
        });
      }

      if (giveaway.status !== 'active') {
        return interaction.reply({
          embeds: [createErrorEmbed('Error', 'This giveaway is not active')],
          ephemeral: true,
        });
      }

      giveaway.status = 'ended';
      await giveaway.save();

      const successEmbed = createSuccessEmbed(
        'Giveaway Ended',
        `The giveaway for **${giveaway.prize}** has been ended.`
      );

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[GIVEAWAY END ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to end giveaway')],
        ephemeral: true,
      });
    }
  },
};
