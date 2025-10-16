// Load env first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClerkClient } from '@clerk/backend';

const client = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

const user = await client.users.getUser('user_346pBWGPp58dnHRjWA5INPgvrtr');

console.log('\n=== CLERK USER DATA ===\n');
console.log('User ID:', user.id);
console.log('Email:', user.emailAddresses[0]?.emailAddress);
console.log('\nPublic Metadata:');
console.log(JSON.stringify(user.publicMetadata, null, 2));
console.log('\nPrivate Metadata:');
console.log(JSON.stringify(user.privateMetadata, null, 2));
console.log('\nUnsafe Metadata:');
console.log(JSON.stringify(user.unsafeMetadata, null, 2));
