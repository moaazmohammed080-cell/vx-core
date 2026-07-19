import mongoose from 'mongoose';
import { config } from '../config/config.js';

export const connectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on('error', (error) => {
      console.error('[DATABASE ERROR]'.error, error.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DATABASE]'.warn, 'Disconnected from MongoDB');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('[DATABASE]'.error, 'Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('[DATABASE]'.info, 'Disconnected from MongoDB');
  } catch (error) {
    console.error('[DATABASE]'.error, 'Failed to disconnect from MongoDB:', error.message);
    throw error;
  }
};
