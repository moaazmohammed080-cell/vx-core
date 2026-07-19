import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  guildName: String,
  ownerId: String,
  
  // Ticket System
  ticketConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    categoryId: String,
    logChannelId: String,
    nextId: {
      type: Number,
      default: 1,
    },
  },
  
  // Welcome System
  welcomeConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    channelId: String,
    message: {
      type: String,
      default: 'Welcome to the server {user}!',
    },
  },
  
  // Leave System
  leaveConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    channelId: String,
    message: {
      type: String,
      default: '{user} has left the server.',
    },
  },
  
  // Auto Role
  autoRoleConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    roleId: String,
  },
  
  // Verification
  verificationConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    channelId: String,
    roleId: String,
    method: {
      type: String,
      enum: ['button', 'reaction', 'command'],
      default: 'button',
    },
  },
  
  // Level System
  levelConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    announceLevel: {
      type: Boolean,
      default: true,
    },
    announceChannel: String,
  },
  
  // Logging
  loggingConfig: {
    enabled: {
      type: Boolean,
      default: true,
    },
    channelId: String,
    logEvents: {
      memberJoin: { type: Boolean, default: true },
      memberLeave: { type: Boolean, default: true },
      messageDelete: { type: Boolean, default: true },
      messageEdit: { type: Boolean, default: true },
      kick: { type: Boolean, default: true },
      ban: { type: Boolean, default: true },
      timeout: { type: Boolean, default: true },
      warn: { type: Boolean, default: true },
    },
  },
  
  prefix: {
    type: String,
    default: '!',
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

guildSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Guild = mongoose.model('Guild', guildSchema);
