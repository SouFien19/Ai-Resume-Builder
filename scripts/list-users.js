/**
 * List all users in the database
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function listUsers() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''} ${!user.firstName && !user.lastName ? '(not set)' : ''}`);
      console.log(`   Username: ${user.username || 'null'}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Plan: ${user.plan || 'free'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

listUsers();
