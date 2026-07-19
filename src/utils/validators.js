export const isValidDuration = (durationMs) => {
  const MIN_DURATION = 60000;
  const MAX_DURATION = 2592000000;
  return durationMs >= MIN_DURATION && durationMs <= MAX_DURATION;
};

export const isValidXpAmount = (xp) => {
  return Number.isInteger(xp) && xp > 0;
};

export const isValidCreditAmount = (credits) => {
  return Number.isInteger(credits) && credits > 0;
};

export const hasModeratorRole = (member, config) => {
  if (!member) return false;
  
  if (member.permissions.has('ADMINISTRATOR')) return true;
  if (member.permissions.has('MODERATE_MEMBERS')) return true;
  if (config.roles.mod && member.roles.cache.has(config.roles.mod)) return true;
  
  return false;
};

export const hasAdminRole = (member, config) => {
  if (!member) return false;
  
  if (member.permissions.has('ADMINISTRATOR')) return true;
  if (config.roles.admin && member.roles.cache.has(config.roles.admin)) return true;
  
  return false;
};

export const checkCooldown = (client, commandName, userId) => {
  if (!client.cooldowns.has(commandName)) {
    client.cooldowns.set(commandName, new Map());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(commandName);
  const cooldownAmount = (5 * 1000);

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return { onCooldown: true, timeLeft: timeLeft.toFixed(1) };
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);

  return { onCooldown: false };
};
