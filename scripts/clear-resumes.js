/**
 * Script to clear all resumes from the database
 * Usage: node scripts/clear-resumes.js
 * 
 * Make sure to set MONGODB_URI in your .env.local file
 */

import('mongoose').then(async (mongooseModule) => {
  const mongoose = mongooseModule.default;
  
  async function clearAllResumes() {
    try {
      // MongoDB connection URI - reads from environment variable
      const MONGODB_URI = process.env.MONGODB_URI;

      if (!MONGODB_URI) {
        console.error('❌ Error: MONGODB_URI environment variable is not set');
        console.log('💡 Tip: Make sure .env.local file exists with MONGODB_URI');
        process.exit(1);
      }

      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');

      // Get the resumes collection
      const db = mongoose.connection.db;
      const resumesCollection = db.collection('resumes');

      // Count existing resumes
      const count = await resumesCollection.countDocuments();
      console.log(`📊 Found ${count} resumes in database`);

      if (count === 0) {
        console.log('✨ Database is already empty');
        await mongoose.connection.close();
        process.exit(0);
        return;
      }

      // Ask for confirmation
      console.log('\n⚠️  WARNING: This will delete ALL resumes from the database!');
      console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

      // Wait 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Delete all resumes
      const result = await resumesCollection.deleteMany({});
      console.log(`🗑️  Deleted ${result.deletedCount} resumes`);

      console.log('✅ All resumes cleared successfully!');
      
      await mongoose.connection.close();
      console.log('👋 Database connection closed');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error clearing resumes:', error);
      process.exit(1);
    }
  }

  // Run the script
  await clearAllResumes();
}).catch((error) => {
  console.error('❌ Failed to load mongoose:', error);
  process.exit(1);
});
