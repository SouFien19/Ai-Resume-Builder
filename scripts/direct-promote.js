/**
 * Direct MongoDB update to promote user to superadmin
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function promoteToSuperAdmin(email) {
  try {
    console.log('🔧 Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      throw new Error('❌ MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find user first
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    console.log('📊 Found user:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Current role: ${user.role}\n`);
    
    // Update role directly
    const result = await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          role: 'superadmin',
          updatedAt: new Date()
        } 
      }
    );
    
    console.log('✅ Update result:', result);
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ email });
    console.log('\n🎉 User updated successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New role: ${updatedUser.role}`);
    console.log('\n👑 You are now a Super Admin!');
    console.log('   Refresh your browser to see the changes.');
    console.log('   You should see a 👑 crown icon in the sidebar.');
    console.log('   You will be redirected to /admin automatically.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

const email = process.argv[2] || 'soufianelabiadh@gmail.com';
promoteToSuperAdmin(email);
