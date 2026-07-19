import mongoose from 'mongoose';

const whitelistSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  type: { type: String, enum: ['user', 'role', 'channel'], required: true },
  targetId: { type: String, required: true },
  targetName: { type: String },
  reason: { type: String },
  addedBy: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  permissions: [{ type: String }],
  metadata: { type: Map, of: String },
});

whitelistSchema.index({ guildId: 1, type: 1, targetId: 1 }, { unique: true });
whitelistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Whitelist', whitelistSchema);
