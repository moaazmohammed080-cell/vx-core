import { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { Ticket } from '../database/models/Ticket.js';
import { User } from '../database/models/User.js';
import { config } from '../config/config.js';
import { Guild } from '../database/models/Guild.js';
import crypto from 'crypto';
import { COLORS, EMOJIS } from '../config/constants.js';

export const createTicket = async (interaction, client) => {
  try {
    const guildConfig = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildConfig?.ticketConfig?.categoryId) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Ticket system not configured')],
        ephemeral: true,
      });
    }

    const userTickets = await Ticket.countDocuments({
      userId: interaction.user.id,
      guildId: interaction.guildId,
      status: 'open',
    });

    if (userTickets >= 5) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'You have reached the maximum number of open tickets (5)')],
        ephemeral: true,
      });
    }

    const ticketId = crypto.randomUUID();
    const ticketNumber = guildConfig.ticketConfig.nextId;

    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: guildConfig.ticketConfig.categoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: interaction.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    });

    const ticket = new Ticket({
      ticketId,
      guildId: interaction.guildId,
      userId: interaction.user.id,
      channelId: channel.id,
      subject: 'No subject',
      status: 'open',
    });

    await ticket.save();

    guildConfig.ticketConfig.nextId += 1;
    await guildConfig.save();

    const welcomeEmbed = new EmbedBuilder()
      .setTitle(`${EMOJIS.TICKET} Support Ticket #${ticketNumber}`)
      .setDescription('Welcome to your support ticket. Please describe your issue below.')
      .addFields(
        { name: 'Ticket ID', value: ticketId, inline: false },
        { name: 'Status', value: 'Open', inline: true },
        { name: 'Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
      )
      .setColor(COLORS.PRIMARY)
      .setTimestamp();

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒')
    );

    await channel.send({ embeds: [welcomeEmbed], components: [closeButton] });

    await interaction.reply({
      embeds: [createSuccessEmbed('Ticket Created', `Your ticket has been created: ${channel}`)],
      ephemeral: true,
    });
  } catch (error) {
    console.error('[CREATE TICKET ERROR]'.error, error);
    await interaction.reply({
      embeds: [createErrorEmbed('Error', 'Failed to create ticket')],
      ephemeral: true,
    });
  }
};

export const verifyUser = async (interaction, client) => {
  try {
    const guildConfig = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildConfig?.verificationConfig?.enabled || !guildConfig.verificationConfig.roleId) {
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Verification system not configured')],
        ephemeral: true,
      });
    }

    const userData = await User.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    if (userData?.isVerified) {
      return interaction.reply({
        embeds: [createErrorEmbed('Already Verified', 'You are already verified')],
        ephemeral: true,
      });
    }

    try {
      await interaction.member.roles.add(guildConfig.verificationConfig.roleId);
    } catch (error) {
      console.error('[ADD ROLE ERROR]'.error, error);
      return interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to add verification role')],
        ephemeral: true,
      });
    }

    await User.findOneAndUpdate(
      { userId: interaction.user.id, guildId: interaction.guildId },
      {
        isVerified: true,
        verifiedAt: new Date(),
      },
      { upsert: true }
    );

    await interaction.reply({
      embeds: [createSuccessEmbed('Verified', 'You have been verified!')],
      ephemeral: true,
    });
  } catch (error) {
    console.error('[VERIFY USER ERROR]'.error, error);
    await interaction.reply({
      embeds: [createErrorEmbed('Error', 'Failed to verify')],
      ephemeral: true,
    });
  }
};
