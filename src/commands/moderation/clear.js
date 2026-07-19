import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from the channel')
    .addNumberOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Delete messages from a specific user')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getNumber('amount');
    const user = interaction.options.getUser('user');

    try {
      await interaction.deferReply();

      let messages = await interaction.channel.messages.fetch({ limit: amount });

      if (user) {
        messages = messages.filter((msg) => msg.author.id === user.id);
      }

      const deleted = await interaction.channel.bulkDelete(messages, true);

      const successEmbed = createSuccessEmbed(
        'Messages Cleared',
        `Deleted ${deleted.size} message${deleted.size !== 1 ? 's' : ''}${user ? ` from ${user}` : ''}`
      );

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[CLEAR ERROR]'.error, error);
      return interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to clear messages')],
      });
    }
  },
};
