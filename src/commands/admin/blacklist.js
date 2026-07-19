import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import SecurityManager from '../../security/SecurityManager.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage blacklist entries')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add entry to blacklist')
        .addStringOption((opt) =>
          opt.setName('type').setDescription('Type of entry').setRequired(true).addChoices(
            { name: 'User', value: 'user' },
            { name: 'Word', value: 'word' },
            { name: 'Invite', value: 'invite' }
          )
        )
        .addStringOption((opt) => opt.setName('value').setDescription('Value to blacklist').setRequired(true))
        .addStringOption((opt) =>
          opt.setName('severity').setDescription('Severity level').setRequired(false).addChoices(
            { name: 'Low', value: 'low' },
            { name: 'Medium', value: 'medium' },
            { name: 'High', value: 'high' },
            { name: 'Critical', value: 'critical' }
          )
        )
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for blacklisting').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove entry from blacklist')
        .addStringOption((opt) => opt.setName('id').setDescription('Entry ID').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription('View blacklist entries')
        .addStringOption((opt) =>
          opt.setName('type').setDescription('Filter by type').setRequired(false).addChoices(
            { name: 'User', value: 'user' },
            { name: 'Word', value: 'word' },
            { name: 'Invite', value: 'invite' }
          )
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const type = interaction.options.getString('type');
      const value = interaction.options.getString('value');
      const severity = interaction.options.getString('severity') || 'medium';
      const reason = interaction.options.getString('reason') || 'No reason provided';

      const result = await SecurityManager.blacklist.addToBlacklist(
        interaction.guildId,
        type,
        interaction.user.id,
        {
          targetId: value,
          targetValue: value,
          severity,
          reason,
        }
      );

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription(`Failed to add to blacklist: ${result.error}`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await SecurityManager.auditLogger.log(interaction.guildId, interaction.user.id, 'blacklist_add', {
        actionType: 'admin',
        severity: 'info',
        targetName: value,
        reason,
        result: 'success',
        changes: { type, value, severity },
      });

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Added to Blacklist')
        .addFields(
          { name: 'Type', value: type, inline: true },
          { name: 'Value', value: value, inline: true },
          { name: 'Severity', value: severity, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'remove') {
      const id = interaction.options.getString('id');

      const result = await SecurityManager.blacklist.removeFromBlacklist(interaction.guildId, id);

      if (!result.success || result.deletedCount === 0) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Entry not found in blacklist');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await SecurityManager.auditLogger.log(interaction.guildId, interaction.user.id, 'blacklist_remove', {
        actionType: 'admin',
        severity: 'info',
        targetId: id,
        result: 'success',
      });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Removed from Blacklist')
        .setDescription('Entry has been removed from the blacklist');

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'list') {
      const type = interaction.options.getString('type');
      const blacklist = await SecurityManager.blacklist.getGuildBlacklist(interaction.guildId, type);

      const embed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTitle('Blacklist Entries')
        .setDescription(blacklist.length === 0 ? 'No entries' : `Total: ${blacklist.length}`);

      if (blacklist.length > 0) {
        const entries = blacklist.slice(0, 10)
          .map((entry) => `**${entry.targetValue}** (${entry.severity}) - ${entry.reason}`)
          .join('\n');
        embed.addFields({ name: 'Entries (showing 10)', value: entries });
      }

      return interaction.reply({ embeds: [embed] });
    }
  },
};
