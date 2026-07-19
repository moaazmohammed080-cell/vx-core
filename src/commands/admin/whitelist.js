import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import SecurityManager from '../../security/SecurityManager.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Manage whitelist entries')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add user to whitelist')
        .addUserOption((opt) => opt.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for whitelisting').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove user from whitelist')
        .addUserOption((opt) => opt.setName('user').setDescription('User to remove').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('View whitelist entries')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      const result = await SecurityManager.whitelist.addToWhitelist(
        interaction.guildId,
        'user',
        user.id,
        interaction.user.id,
        {
          targetName: user.username,
          reason,
        }
      );

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription(`Failed to add user to whitelist: ${result.error}`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await SecurityManager.auditLogger.log(interaction.guildId, interaction.user.id, 'whitelist_add', {
        actionType: 'admin',
        targetId: user.id,
        targetName: user.username,
        reason,
        result: 'success',
      });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('User Whitelisted')
        .addFields({
          name: 'User',
          value: `<@${user.id}>`,
          inline: true,
        },
        {
          name: 'Reason',
          value: reason,
          inline: true,
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'remove') {
      const user = interaction.options.getUser('user');

      const result = await SecurityManager.whitelist.removeFromWhitelist(
        interaction.guildId,
        'user',
        user.id
      );

      if (!result.success || result.deletedCount === 0) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('User not found in whitelist');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await SecurityManager.auditLogger.log(interaction.guildId, interaction.user.id, 'whitelist_remove', {
        actionType: 'admin',
        targetId: user.id,
        targetName: user.username,
        result: 'success',
      });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('User Removed from Whitelist')
        .setDescription(`<@${user.id}> has been removed from the whitelist`);

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'list') {
      const whitelist = await SecurityManager.whitelist.getGuildWhitelist(interaction.guildId, 'user');

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Whitelist Entries')
        .setDescription(whitelist.length === 0 ? 'No entries' : `Total: ${whitelist.length}`)
        .setTimestamp();

      if (whitelist.length > 0) {
        const entries = whitelist.slice(0, 10).map((entry) => `<@${entry.targetId}> - ${entry.reason || 'No reason'}`).join('\n');
        embed.addFields({
          name: 'Entries (showing 10)',
          value: entries,
        });
      }

      return interaction.reply({ embeds: [embed] });
    }
  },
};
