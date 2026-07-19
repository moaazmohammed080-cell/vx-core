import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createInfoEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket system message'),

  async execute(interaction) {
    const embed = createInfoEmbed(
      '🎫 Support Tickets',
      'Click the button below to create a support ticket.'
    ).addFields(
      { name: 'Response Time', value: 'We typically respond within 24 hours', inline: false },
      { name: 'Guidelines', value: 'Please provide detailed information about your issue', inline: false }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫')
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
