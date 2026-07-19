import mongoose from 'mongoose';

const securitySettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  enabled: { type: Boolean, default: true },
  whitelistMode: { type: Boolean, default: false },
  blacklistMode: { type: Boolean, default: true },
  autoModeration: { type: Boolean, default: true },
  loggingLevel: { type: String, enum: ['all', 'important', 'critical'], default: 'important' },
  maxViolations: { type: Number, default: 3 },
  muteDuration: { type: Number, default: 3600000 }, // 1 hour
  kickThreshold: { type: Number, default: 5 },
  banThreshold: { type: Number, default: 10 },
  spamFilter: {
    enabled: { type: Boolean, default: true },
    messageLimit: { type: Number, default: 5 },
    timeWindow: { type: Number, default: 5000 }, // 5 seconds
  },
  inviteFilter: {
    enabled: { type: Boolean, default: true },
    allowWhitelisted: { type: Boolean, default: true },
  },
  profanityFilter: {
    enabled: { type: Boolean, default: true },
    action: { type: String, default: 'warn' },
  },
  adminRoles: [{ type: String }],
  modRoles: [{ type: String }],
  securityLogChannel: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('SecuritySettings', securitySettingsSchema);
