/**
 * MongoDB Database Connection
 * Secure, optimized connection with proper error handling
 */

import mongoose, { Mongoose } from 'mongoose';
import { logger } from '@/lib/logger';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Validate SSL in production
if (process.env.NODE_ENV === 'production') {
  if (!MONGODB_URI.includes('ssl=true') && !MONGODB_URI.includes('retryWrites=true')) {
    logger.warn('MongoDB connection should use SSL and retryWrites in production');
  }
}

interface CachedMongoose {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: CachedMongoose = (globalThis as any).mongoose;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with optimized settings
 */
async function dbConnect(): Promise<Mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if not in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      
      // Connection pool settings
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
      minPoolSize: 2,
      
      // Timeout settings
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Security settings
      ...(process.env.NODE_ENV === 'production' && {
        ssl: true,
        tls: true,
      }),
    };

    logger.info('Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        logger.info('MongoDB connected successfully', {
          host: mongooseInstance.connection.host,
          name: mongooseInstance.connection.name,
        });
        return mongooseInstance;
      })
      .catch((error) => {
        logger.error('MongoDB connection failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Mask credentials in logs
        });
        
        // Reset cached promise to allow retry
        cached.promise = null;
        
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset both cached values on failure
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in serverless environments
 */
export async function dbDisconnect(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    logger.info('MongoDB disconnected');
  }
}

/**
 * Check if MongoDB is connected
 */
export function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

/**
 * Get connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  host?: string;
  name?: string;
} {
  return {
    isConnected: isConnected(),
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}

export default dbConnect;

