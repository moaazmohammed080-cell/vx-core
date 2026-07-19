import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import SecurityManager from '../../security/SecurityManager.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('security')
    .setDescription('Manage security settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) => sub.setName('report').setDescription('View security report'))
    .addSubcommand((sub) =>
      sub
        .setName('enable')
        .setDescription('Enable security system')
    )
    .addSubcommand((sub) =>
      sub.setName('disable').setDescription('Disable security system')
    )
    .addSubcommand((sub) =>
      sub
        .setName('whitelist-mode')
        .setDescription('Toggle whitelist mode')
        .addBooleanOption((opt) => opt.setName('enabled').setDescription('Enable whitelist mode').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('automod')
        .setDescription('Toggle auto moderation')
        .addBooleanOption((opt) => opt.setName('enabled').setDescription('Enable auto moderation').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'report') {
      const report = await SecurityManager.getSecurityReport(interaction.guildId);

      if (!report.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to generate security report');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Security Report')
        .addFields(
          { name: 'System Status', value: report.data.settings.enabled ? 'Enabled' : 'Disabled', inline: true },
          { name: 'Whitelist Mode', value: report.data.settings.whitelistMode ? 'Enabled' : 'Disabled', inline: true },
          { name: 'Blacklist Mode', value: report.data.settings.blacklistMode ? 'Enabled' : 'Disabled', inline: true },
          {
            name: 'Statistics',
            value: `Whitelisted: ${report.data.statistics.whitelistCount}\nBlacklisted: ${report.data.statistics.blacklistCount}\nTotal Logs: ${report.data.statistics.totalLogs}\nCritical Violations: ${report.data.statistics.recentViolations}`,
          }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'enable') {
      const result = await SecurityManager.enableSecurity(interaction.guildId);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to enable security system');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await SecurityManager.auditLogger.log(interaction.guildId, interaction.user.id, 'security_enabled', {
        actionType: 'admin',
        severity: 'info',
        result: 'success',
      });

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Security System Enabled');

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'disable') {
      const result = await SecurityManager.disableSecurity(interaction.guildId);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to disable security system');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await SecurityManager.auditLogger.log(interaction.guildId, interaction.user.id, 'security_disabled', {
        actionType: 'admin',
        severity: 'warning',
        result: 'success',
      });

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('Security System Disabled');

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'whitelist-mode') {
      const enabled = interaction.options.getBoolean('enabled');
      const result = await SecurityManager.setWhitelistMode(interaction.guildId, enabled);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to update whitelist mode');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Whitelist Mode Updated')
        .setDescription(`Whitelist mode is now ${enabled ? 'enabled' : 'disabled'}`);

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'automod') {
      const enabled = interaction.options.getBoolean('enabled');
      const result = await SecurityManager.setAutoModeration(interaction.guildId, enabled);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to update auto moderation');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Auto Moderation Updated')
        .setDescription(`Auto moderation is now ${enabled ? 'enabled' : 'disabled'}`);

      return interaction.reply({ embeds: [embed] });
    }
  },
};
