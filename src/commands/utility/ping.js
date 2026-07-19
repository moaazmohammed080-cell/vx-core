import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot ping'),

  async execute(interaction) {
    const latency = Math.round(interaction.client.ws.ping);

    const embed = createInfoEmbed(
      'Pong!',
      `Bot Latency: **${latency}ms**`
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
