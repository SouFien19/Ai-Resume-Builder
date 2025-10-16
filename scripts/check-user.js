/**
 * Direct MongoDB check for user role
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUser(email) {
  try {
    console.log('🔧 Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('📊 User Details:');
    console.log(JSON.stringify(user, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

const email = process.argv[2] || 'soufianelabiadh@gmail.com';
checkUser(email);
