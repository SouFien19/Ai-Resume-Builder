/**
 * Fix Username Index - Remove unique constraint from username field
 * This allows multiple users with null usernames
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixUsernameIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // List all indexes
    console.log('📋 Current indexes on users collection:');
    const indexes = await usersCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    console.log('');

    // Check if username_1 index exists
    const hasUsernameIndex = indexes.some(idx => idx.name === 'username_1');
    
    if (hasUsernameIndex) {
      console.log('🗑️  Dropping username_1 index...');
      await usersCollection.dropIndex('username_1');
      console.log('✅ Username index dropped successfully\n');
    } else {
      console.log('ℹ️  No username_1 index found (already removed or never existed)\n');
    }

    // Create a new non-unique index on username (optional, for query performance)
    console.log('📌 Creating non-unique index on username...');
    await usersCollection.createIndex({ username: 1 }, { sparse: true });
    console.log('✅ Non-unique sparse index created\n');

    console.log('🎉 SUCCESS! Username field is no longer unique.');
    console.log('   Multiple users can now have null usernames.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

fixUsernameIndex();
