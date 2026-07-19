import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createGiveawayEmbed, createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { Giveaway } from '../../database/models/Giveaway.js';
import { isValidDuration } from '../../utils/validators.js';
import crypto from 'crypto';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .addStringOption((option) =>
      option
        .setName('prize')
        .setDescription('Prize for the giveaway')
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
        .setMinValue(1)
    )
    .addNumberOption((option) =>
      option
        .setName('duration')
        .setDescription('Duration in seconds')
        .setRequired(true)
        .setMinValue(60)
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Giveaway description')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getNumber('winners');
    const durationSeconds = interaction.options.getNumber('duration');
    const description = interaction.options.getString('description') || '';

    const durationMs = durationSeconds * 1000;

    if (!isValidDuration(durationMs)) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', `Duration must be between 1 minute and 30 days`)],
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply();

      const endDate = new Date(Date.now() + durationMs);
      const giveawayId = crypto.randomUUID();

      const giveaway = new Giveaway({
        giveawayId,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        prize,
        description,
        createdBy: interaction.user.id,
        winnerCount: winners,
        endDate,
        status: 'active',
      });

      await giveaway.save();

      const embed = createGiveawayEmbed(prize, winners, endDate).setDescription(
        description || 'React with 🎉 to enter the giveaway!'
      );

      const message = await interaction.channel.send({ embeds: [embed] });
      await message.react('🎉');

      giveaway.messageId = message.id;
      await giveaway.save();

      setTimeout(async () => {
        const updatedGiveaway = await Giveaway.findOne({ giveawayId });
        if (updatedGiveaway && updatedGiveaway.status === 'active') {
          const reactions = await message.reactions.cache.get('🎉')?.users.fetch();
          const participants = reactions
            ?.filter((user) => !user.bot)
            .map((user) => user.id) || [];

          if (participants.length === 0) {
            await message.reply('No participants in this giveaway!');
            updatedGiveaway.status = 'ended';
            await updatedGiveaway.save();
            return;
          }

          const selectedWinners = [];
          for (let i = 0; i < Math.min(winners, participants.length); i++) {
            const randomIndex = Math.floor(Math.random() * participants.length);
            selectedWinners.push(participants[randomIndex]);
            participants.splice(randomIndex, 1);
          }

          updatedGiveaway.winners = selectedWinners;
          updatedGiveaway.status = 'ended';
          await updatedGiveaway.save();

          const winnerMentions = selectedWinners.map((id) => `<@${id}>`).join(', ');
          await message.reply({
            content: `🎉 Congratulations ${winnerMentions}! You won **${prize}**!`,
          });
        }
      }, durationMs);

      const successEmbed = createSuccessEmbed(
        'Giveaway Started',
        `Prize: **${prize}**\nWinners: **${winners}**\nEnds: <t:${Math.floor(endDate.getTime() / 1000)}:R>`
      );

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[GIVEAWAY START ERROR]'.error, error);
      return interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to start giveaway')],
      });
    }
  },
};
