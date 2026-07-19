import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import SecurityCore from '../../security/SecurityCore.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('securitycore')
    .setDescription('Manage Security Core')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) => sub.setName('status').setDescription('View security core status'))
    .addSubcommand((sub) =>
      sub.setName('module').setDescription('Manage security modules').addStringOption((opt) =>
        opt
          .setName('action')
          .setDescription('Action to perform')
          .setRequired(true)
          .addChoices(
            { name: 'Enable', value: 'enable' },
            { name: 'Disable', value: 'disable' },
            { name: 'Status', value: 'status' }
          )
      )
        .addStringOption((opt) =>
          opt
            .setName('module')
            .setDescription('Module name')
            .setRequired(true)
            .addChoices(
              { name: 'AntiRaid', value: 'antiRaid' },
              { name: 'AntiNuke', value: 'antiNuke' },
              { name: 'AntiSpam', value: 'antiSpam' },
              { name: 'AntiLink', value: 'antiLink' },
              { name: 'AntiInvite', value: 'antiInvite' },
              { name: 'AntiWebhook', value: 'antiWebhook' },
              { name: 'AntiBot', value: 'antiBot' },
              { name: 'AntiChannel', value: 'antiChannel' },
              { name: 'AntiRole', value: 'antiRole' },
              { name: 'AntiGuild', value: 'antiGuild' }
            )
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      await interaction.deferReply();

      const status = await SecurityCore.getSecurityStatus(interaction.guildId);

      if (!status) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to retrieve security status');
        return interaction.editReply({ embeds: [embed] });
      }

      const modulesList = Object.entries(status.modules)
        .map(
          ([name, data]) =>
            `${data.enabled ? '✅' : '❌'} **${name}**: ${data.enabled ? 'Enabled' : 'Disabled'}`
        )
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Security Core Status')
        .addFields(
          {
            name: 'System Status',
            value: status.enabled ? '✅ Enabled' : '❌ Disabled',
            inline: true,
          },
          {
            name: 'Modules',
            value: modulesList,
          },
          {
            name: 'Statistics',
            value: `Whitelisted: ${status.statistics.whitelisted}\nBlacklisted: ${status.statistics.blacklisted}\nTotal Logs: ${status.statistics.totalLogs}\nBackups: ${status.statistics.backups}\nCritical Incidents: ${status.statistics.criticalIncidents}`,
          }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === 'module') {
      const action = interaction.options.getString('action');
      const moduleName = interaction.options.getString('module');

      let result;

      if (action === 'enable') {
        result = await SecurityCore.enableModule(interaction.guildId, moduleName);
      } else if (action === 'disable') {
        result = await SecurityCore.disableModule(interaction.guildId, moduleName);
      } else if (action === 'status') {
        const moduleStatus = await SecurityCore.getModuleStatus(interaction.guildId);
        const statusData = moduleStatus[moduleName];

        if (!statusData) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription(`Module ${moduleName} not found`);
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle(`Module Status: ${moduleName}`)
          .addFields(
            { name: 'Status', value: statusData.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            {
              name: 'Config',
              value: `\`\`\`json\n${JSON.stringify(statusData.config, null, 2)}\`\`\``,
            }
          );

        return interaction.reply({ embeds: [embed] });
      }

      if (!result) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Error')
          .setDescription('Failed to update module');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Module Updated')
        .setDescription(`Module **${moduleName}** is now ${action === 'enable' ? 'enabled' : 'disabled'}`);

      return interaction.reply({ embeds: [embed] });
    }
  },
};
