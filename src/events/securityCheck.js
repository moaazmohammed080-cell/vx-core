import SecurityManager from '../security/SecurityManager.js';

export const event = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    try {
      const settings = await SecurityManager.getSecuritySettings(message.guildId);
      if (!settings.data.enabled) return;

      // Check for blacklisted users
      const userCheck = await SecurityManager.performSecurityCheck(
        message.guildId,
        message.author.id,
        'user',
        message.author.id
      );

      if (userCheck.blocked) {
        await SecurityManager.auditLogger.log(
          message.guildId,
          message.author.id,
          'blocked_message',
          {
            actionType: 'security',
            severity: 'critical',
            targetId: message.author.id,
            reason: userCheck.reason,
            result: 'success',
          }
        );
        return message.delete().catch(() => {});
      }

      // Check for blacklisted words
      const blacklistedWords = await SecurityManager.blacklist.getGuildBlacklist(
        message.guildId,
        'word'
      );

      for (const word of blacklistedWords) {
        if (message.content.toLowerCase().includes(word.targetValue.toLowerCase())) {
          if (settings.data.profanityFilter.enabled) {
            await SecurityManager.auditLogger.log(
              message.guildId,
              message.author.id,
              'blacklisted_word',
              {
                actionType: 'security',
                severity: 'warning',
                reason: `Blacklisted word detected: ${word.targetValue}`,
                result: 'success',
              }
            );
            return message.delete().catch(() => {});
          }
        }
      }

      // Check for invites
      if (settings.data.inviteFilter.enabled) {
        const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/gi;
        if (inviteRegex.test(message.content)) {
          const isWhitelisted = await SecurityManager.whitelist.isWhitelisted(
            message.guildId,
            'invite',
            message.author.id
          );

          if (!isWhitelisted) {
            await SecurityManager.auditLogger.log(
              message.guildId,
              message.author.id,
              'blocked_invite',
              {
                actionType: 'security',
                severity: 'warning',
                reason: 'Invite link detected',
                result: 'success',
              }
            );
            return message.delete().catch(() => {});
          }
        }
      }
    } catch (error) {
      console.error('[SECURITY ERROR]'.error, error);
    }
  },
};
