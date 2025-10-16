/**
 * Force Role Update Script
 * 
 * This script updates a user's role in BOTH Clerk and MongoDB
 * Run this if webhook isn't working or you need to manually promote someone
 * 
 * Usage:
 * npx tsx --env-file=.env.local scripts/set-superadmin.ts YOUR_EMAIL
 */

// Load .env.local FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClerkClient } from '@clerk/backend';
import dbConnect from '../src/lib/database/connection';
import User from '../src/lib/database/models/User';

async function setSuperadmin(email: string) {
  console.log('\n' + '='.repeat(50));
  console.log('👑 SET SUPERADMIN');
  console.log('='.repeat(50));
  console.log(`\n📧 Email: ${email}\n`);
  
  try {
    // Check environment
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY not found in .env.local');
    }
    
    // Connect to MongoDB
    await dbConnect();
    console.log('✅ Connected to MongoDB\n');
    
    // Find user in MongoDB
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error(`User with email ${email} not found in MongoDB`);
    }
    
    console.log(`👤 Found user: ${user.name || 'Unknown'}`);
    console.log(`   Current role: ${user.role || 'user'}`);
    console.log(`   Clerk ID: ${user.clerkId}\n`);
    
    // Update Clerk metadata
    const client = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY 
    });
    
    console.log('🔄 Updating role in Clerk...');
    await client.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: 'superadmin',
      },
    });
    console.log('✅ Clerk updated: role = superadmin\n');
    
    // Update MongoDB
    console.log('🔄 Updating role in MongoDB...');
    await User.findOneAndUpdate(
      { clerkId: user.clerkId },
      { role: 'superadmin' }
    );
    console.log('✅ MongoDB updated: role = superadmin\n');
    
    console.log('='.repeat(50));
    console.log('🎉 SUCCESS!');
    console.log('='.repeat(50));
    console.log('\n⚠️  IMPORTANT NEXT STEP:');
    console.log('   1. Sign out from your app');
    console.log('   2. Sign back in');
    console.log('   3. You should be redirected to /admin\n');
    console.log('✨ Role promotion complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('\n❌ Error: Email required');
  console.log('\nUsage:');
  console.log('  npx tsx --env-file=.env.local scripts/set-superadmin.ts YOUR_EMAIL');
  console.log('\nExample:');
  console.log('  npx tsx --env-file=.env.local scripts/set-superadmin.ts soufianelabiadh@gmail.com\n');
  process.exit(1);
}

setSuperadmin(email)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
