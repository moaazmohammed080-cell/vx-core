import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String },
  userAvatar: { type: String },
  action: { type: String, required: true, index: true },
  actionType: { type: String, enum: ['security', 'moderation', 'admin', 'system', 'bot'], required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  targetId: { type: String },
  targetName: { type: String },
  reason: { type: String },
  changes: { type: Map, of: String },
  result: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  timestamp: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Map, of: String },
});

auditLogSchema.index({ guildId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ actionType: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
