import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  subject: String,
  description: String,
  status: {
    type: String,
    enum: ['open', 'closed', 'claimed'],
    default: 'open',
  },
  claimedBy: String,
  claimedAt: Date,
  
  messageCount: {
    type: Number,
    default: 0,
  },
  
  messages: [{
    userId: String,
    username: String,
    content: String,
    timestamp: Date,
  }],
  
  closedAt: Date,
  closedBy: String,
  closeReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Ticket = mongoose.model('Ticket', ticketSchema);
