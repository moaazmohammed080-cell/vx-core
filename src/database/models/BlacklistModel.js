import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  type: { type: String, enum: ['user', 'role', 'channel', 'word', 'invite'], required: true },
  targetId: { type: String },
  targetValue: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  reason: { type: String, required: true },
  addedBy: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  action: { type: String, enum: ['warn', 'mute', 'kick', 'ban', 'delete'], default: 'warn' },
  autoAction: { type: Boolean, default: true },
  violations: { type: Number, default: 0 },
  metadata: { type: Map, of: String },
});

blacklistSchema.index({ guildId: 1, type: 1 });
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Blacklist', blacklistSchema);
