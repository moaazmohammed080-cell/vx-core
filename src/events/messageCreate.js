import { config } from '../config/config.js';
import { User } from '../database/models/User.js';
import { createLevelUpEmbed } from '../utils/embeds.js';
import { LEVEL_REQUIREMENTS } from '../config/constants.js';

const xpCache = new Map();

export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    if (!config.features.levelSystem) return;

    try {
      const userId = message.author.id;
      const guildId = message.guild.id;
      const key = `${userId}-${guildId}`;

      if (xpCache.has(key)) {
        return;
      }

      xpCache.set(key, true);
      setTimeout(() => xpCache.delete(key), LEVEL_REQUIREMENTS.cooldownPerMessage);

      let userData = await User.findOne({ userId, guildId });
      if (!userData) {
        userData = new User({
          userId,
          guildId,
          username: message.author.username,
          avatar: message.author.displayAvatarURL(),
        });
      }

      const xpToAdd = LEVEL_REQUIREMENTS.xpPerMessage;
      userData.xp += xpToAdd;
      userData.totalXp += xpToAdd;
      userData.lastXpGain = new Date();

      const oldLevel = userData.level;
      userData.level = Math.floor(userData.totalXp / 100) + 1;

      await userData.save();

      if (userData.level > oldLevel) {
        const levelUpEmbed = createLevelUpEmbed(
          message.author,
          userData.level,
          userData.totalXp
        );
        await message.reply({ embeds: [levelUpEmbed] }).catch(() => {});
      }
    } catch (error) {
      console.error('[MESSAGE CREATE ERROR]'.error, error);
    }
  },
};
