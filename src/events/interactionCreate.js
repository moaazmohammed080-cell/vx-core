import { InteractionType } from 'discord.js';
import { createErrorEmbed } from '../utils/embeds.js';
import { checkCooldown } from '../utils/validators.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          return interaction.reply({
            embeds: [createErrorEmbed('Error', 'Command not found')],
            ephemeral: true,
          });
        }

        const cooldown = checkCooldown(client, interaction.commandName, interaction.user.id);
        if (cooldown.onCooldown) {
          return interaction.reply({
            embeds: [createErrorEmbed('Cooldown', `Please wait ${cooldown.timeLeft}s before using this command again`)],
            ephemeral: true,
          });
        }

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error('[COMMAND ERROR]'.error, error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              embeds: [createErrorEmbed('Error', 'An error occurred while executing the command')],
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              embeds: [createErrorEmbed('Error', 'An error occurred while executing the command')],
              ephemeral: true,
            });
          }
        }
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket') {
          const { createTicket } = await import('../handlers/buttonHandler.js');
          await createTicket(interaction, client);
        } else if (interaction.customId === 'verify') {
          const { verifyUser } = await import('../handlers/buttonHandler.js');
          await verifyUser(interaction, client);
        }
      }
    } catch (error) {
      console.error('[INTERACTION ERROR]'.error, error);
    }
  },
};
