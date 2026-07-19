import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  username: String,
  avatar: String,
  
  // Credit System
  credits: {
    type: Number,
    default: 1000,
  },
  lastDailyBonus: {
    type: Date,
    default: null,
  },
  
  // Level System
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  totalXp: {
    type: Number,
    default: 0,
  },
  lastXpGain: {
    type: Date,
    default: null,
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  
  // Moderation
  warnings: {
    type: Number,
    default: 0,
  },
  timeouts: [{
    moderator: String,
    reason: String,
    duration: String,
    timestamp: Date,
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema);
