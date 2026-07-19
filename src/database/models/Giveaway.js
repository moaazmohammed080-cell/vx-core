import mongoose from 'mongoose';

const giveawaySchema = new mongoose.Schema({
  giveawayId: {
    type: String,
    required: true,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  messageId: String,
  channelId: {
    type: String,
    required: true,
  },
  prize: {
    type: String,
    required: true,
  },
  description: String,
  createdBy: String,
  
  winnerCount: {
    type: Number,
    default: 1,
  },
  
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  
  participants: [String],
  winners: [String],
  
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active',
  },
  
  isMultiplier: {
    type: Boolean,
    default: false,
  },
  
  requiredRole: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Giveaway = mongoose.model('Giveaway', giveawaySchema);
