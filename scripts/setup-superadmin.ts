/**
 * Super Admin Setup Script
 * Run this script to promote your account to super admin
 * 
 * Usage:
 * node --loader ts-node/esm scripts/setup-superadmin.ts
 * 
 * Or with npm:
 * npm run setup:superadmin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// User Schema (simplified for script)
interface IUser {
  clerkId: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
}, { strict: false }); // Allow other fields

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

async function setupSuperAdmin() {
  try {
    console.log('🚀 Super Admin Setup Script\n');

    // Get MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI not found in environment variables');
      console.log('\n💡 Make sure you have a .env.local file with MONGODB_URI');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Prompt for user identification
    console.log('📝 Enter one of the following to identify your account:');
    console.log('   1. Your Clerk User ID (starts with "user_")');
    console.log('   2. Your email address');
    console.log('   3. Leave empty to list all users\n');

    // Get input from command line arguments or prompt
    const identifier = process.argv[2];

    if (!identifier) {
      // List all users
      console.log('📋 Listing all users:\n');
      const users = await User.find().select('clerkId email role').lean();
      
      if (users.length === 0) {
        console.log('❌ No users found in database');
        console.log('\n💡 Make sure users are synced from Clerk');
        await mongoose.disconnect();
        process.exit(1);
      }

      users.forEach((user: any, index: number) => {
        const roleEmoji = user.role === 'superadmin' ? '👑' : user.role === 'admin' ? '🛡️' : '👤';
        console.log(`${index + 1}. ${roleEmoji} ${user.email}`);
        console.log(`   Clerk ID: ${user.clerkId}`);
        console.log(`   Role: ${user.role}\n`);
      });

      console.log('\n💡 Run the script again with your Clerk ID or email:');
      console.log('   npm run setup:superadmin <clerk_id_or_email>');
      console.log('   or');
      console.log('   node scripts/setup-superadmin.ts <clerk_id_or_email>');
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Find user by Clerk ID or email
    let user;
    if (identifier.startsWith('user_')) {
      console.log(`🔍 Looking for user with Clerk ID: ${identifier}`);
      user = await User.findOne({ clerkId: identifier });
    } else {
      console.log(`🔍 Looking for user with email: ${identifier}`);
      user = await User.findOne({ email: identifier.toLowerCase() });
    }

    if (!user) {
      console.error(`\n❌ Error: User not found`);
      console.log('\n💡 Make sure:');
      console.log('   1. You have signed up on the platform');
      console.log('   2. Your account is synced from Clerk');
      console.log('   3. You entered the correct email or Clerk ID');
      console.log('\n   Run without arguments to list all users');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('\n✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerkId}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === 'superadmin') {
      console.log('\n✅ User is already a super admin!');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update to superadmin
    console.log('\n🔧 Promoting user to super admin...');
    user.role = 'superadmin';
    await user.save();

    console.log('\n🎉 SUCCESS! User promoted to super admin');
    console.log('\n👑 Super Admin Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerkId}`);
    console.log(`   Role: ${user.role}`);
    
    console.log('\n✅ You can now access the admin panel at:');
    console.log('   http://localhost:3000/admin');
    console.log('   or');
    console.log('   https://yourdomain.com/admin');

    console.log('\n📝 Next steps:');
    console.log('   1. Sign in to your account');
    console.log('   2. Navigate to /admin');
    console.log('   3. Start managing your platform!');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
setupSuperAdmin();
