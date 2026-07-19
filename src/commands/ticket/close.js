import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { Ticket } from '../../database/models/Ticket.js';

export default {
  data: new SlashCommandBuilder()
    .setName('closeticket')
    .setDescription('Close a ticket')
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for closing the ticket')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });

      if (!ticket) {
        return interaction.reply({
          embeds: [createErrorEmbed('Error', 'This is not a ticket channel')],
          ephemeral: true,
        });
      }

      ticket.status = 'closed';
      ticket.closedAt = new Date();
      ticket.closedBy = interaction.user.id;
      ticket.closeReason = reason;
      await ticket.save();

      const successEmbed = createSuccessEmbed(
        'Ticket Closed',
        `This ticket has been closed.\n\n**Reason:** ${reason}`
      );

      await interaction.reply({ embeds: [successEmbed] });

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 5000);
    } catch (error) {
      console.error('[CLOSE TICKET ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to close ticket')],
        ephemeral: true,
      });
    }
  },
};
