/**
 * Migration Script: Move User Roles from MongoDB to Clerk Metadata
 * 
 * This script reads all users from MongoDB and updates their Clerk
 * metadata with their role, so we can use JWT-based role checks.
 * 
 * Run this ONCE after setting up webhooks:
 * npx tsx scripts/migrate-roles-to-clerk.ts
 */

// Load .env.local FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClerkClient } from '@clerk/backend';
import dbConnect from '../src/lib/database/connection';
import User from '../src/lib/database/models/User';

async function migrateRolesToClerk() {
  console.log('\n🔄 Starting role migration from MongoDB to Clerk...\n');
  
  try {
    // Connect to MongoDB
    await dbConnect();
    console.log('✅ Connected to MongoDB\n');
    
    // Get all users
    const users = await User.find({}).select('clerkId role name email');
    console.log(`📊 Found ${users.length} users to migrate\n`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ clerkId: string; error: string }> = [];
    
    // Get Clerk client
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY not found in environment variables');
    }
    
    const client = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY 
    });
    
    // Migrate each user
    for (const user of users) {
      try {
        const role = user.role || 'user';
        
        // Update Clerk metadata
        await client.users.updateUserMetadata(user.clerkId, {
          publicMetadata: {
            role,
          },
        });
        
        successCount++;
        console.log(`✅ ${user.email || user.name}: ${role}`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ 
          clerkId: user.clerkId, 
          error: errorMsg 
        });
        console.error(`❌ ${user.email || user.name}: ${errorMsg}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / users.length) * 100).toFixed(1)}%`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(({ clerkId, error }) => {
        console.log(`  - ${clerkId}: ${error}`);
      });
    }
    
    console.log('\n✨ Migration complete!\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
console.log('\n' + '='.repeat(50));
console.log('🔐 CLERK ROLE MIGRATION');
console.log('='.repeat(50));

migrateRolesToClerk()
  .then(() => {
    console.log('✅ Migration script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
