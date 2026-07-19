import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import SecurityManager from '../../security/SecurityManager.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('audit')
    .setDescription('View audit logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('recent')
        .setDescription('View recent audit logs')
        .addNumberOption((opt) => opt.setName('limit').setDescription('Number of logs').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('user')
        .setDescription('View audit logs for a user')
        .addUserOption((opt) => opt.setName('user').setDescription('User to check').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('action')
        .setDescription('View logs for a specific action')
        .addStringOption((opt) => opt.setName('action').setDescription('Action to filter').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'recent') {
      const limit = interaction.options.getNumber('limit') || 10;

      const result = await SecurityManager.auditLogger.getAuditLogs(interaction.guildId, {
        limit: Math.min(limit, 50),
      });

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to retrieve audit logs');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Recent Audit Logs')
        .setDescription(`Total logs: ${result.total}`);

      if (result.data.length > 0) {
        const logs = result.data
          .slice(0, 10)
          .map(
            (log) =>
              `**${log.action}** by <@${log.userId}>\n${log.reason || 'No reason'} - ${new Date(log.timestamp).toLocaleString()}`
          )
          .join('\n\n');
        embed.setDescription(logs);
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'user') {
      const user = interaction.options.getUser('user');
      const result = await SecurityManager.auditLogger.getUserActivityLog(interaction.guildId, user.id, 20);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to retrieve user logs');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`Audit Logs for ${user.username}`);

      if (result.data.length > 0) {
        const logs = result.data
          .slice(0, 10)
          .map((log) => `**${log.action}** - ${log.reason || 'No reason'} - ${new Date(log.timestamp).toLocaleString()}`)
          .join('\n\n');
        embed.setDescription(logs);
      } else {
        embed.setDescription('No audit logs found for this user');
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'action') {
      const action = interaction.options.getString('action');
      const result = await SecurityManager.auditLogger.getActionLog(interaction.guildId, action, 20);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to retrieve action logs');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`Logs for Action: ${action}`);

      if (result.data.length > 0) {
        const logs = result.data
          .slice(0, 10)
          .map(
            (log) =>
              `by <@${log.userId}> - ${log.reason || 'No reason'} - ${new Date(log.timestamp).toLocaleString()}`
          )
          .join('\n\n');
        embed.setDescription(logs);
      } else {
        embed.setDescription(`No logs found for action: ${action}`);
      }

      return interaction.reply({ embeds: [embed] });
    }
  },
};
