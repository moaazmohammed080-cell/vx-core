import { config } from '../config/config.js';
import { logToChannel } from '../utils/logger.js';

export default {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || !message.author || message.author.bot) return;

    if (!config.features.logging) return;

    await logToChannel(message.guild, 'messageDelete', {
      author: message.author,
      channel: message.channel,
      content: message.content,
    });
  },
};
