# Super Admin Setup Guide

## 🚀 Quick Setup - Choose One Method

### Method 1: Using Node.js Script (Recommended)

```bash
# List all users
node scripts/setup-superadmin.js

# Promote by email
node scripts/setup-superadmin.js your-email@example.com

# Promote by Clerk ID
node scripts/setup-superadmin.js user_xxxxxxxxxxxxx
```

### Method 2: Direct MongoDB Command

#### Using MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your database
3. Go to the `users` collection
4. Find your user document
5. Click "Edit Document"
6. Change `role` field from `"user"` to `"superadmin"`
7. Click "Update"

#### Using Mongo Shell:

```javascript
// Connect to your MongoDB
mongosh "your-mongodb-connection-string"

// List all users to find your account
db.users.find({}, { email: 1, clerkId: 1, role: 1 })

// Promote by email
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "superadmin" } }
)

// Promote by Clerk ID
db.users.updateOne(
  { clerkId: "user_xxxxxxxxxxxxx" },
  { $set: { role: "superadmin" } }
)

// Verify the update
db.users.findOne({ email: "your-email@example.com" })
```

### Method 3: Using MongoDB Atlas Web Interface

1. Go to https://cloud.mongodb.com/
2. Navigate to your cluster
3. Click "Browse Collections"
4. Select your database → "users" collection
5. Find your user document
6. Click the pencil icon to edit
7. Change `"role": "user"` to `"role": "superadmin"`
8. Save changes

## 📋 Prerequisites

Before running the setup:

1. ✅ **You must have signed up** on the platform at least once
2. ✅ **MongoDB must be running** and accessible
3. ✅ **Environment variables** must be set in `.env.local`
4. ✅ **Know your email or Clerk User ID** (starts with `user_`)

## 🔍 Finding Your Clerk User ID

### Option 1: Check Clerk Dashboard

1. Go to https://dashboard.clerk.com/
2. Navigate to "Users"
3. Click on your user
4. Copy the User ID (starts with `user_`)

### Option 2: Check Browser Console

1. Sign in to your app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `localStorage.getItem('clerk-db-jwt')`
5. The User ID is in the token

### Option 3: Use the List Command

```bash
node scripts/setup-superadmin.js
```

This will list all users with their IDs and emails.

## 🎯 What You Get as Super Admin

### Full Access To:

- 👥 **User Management**: Ban, suspend, promote, demote users
- 📊 **Analytics Dashboard**: Real-time stats and insights
- 💰 **AI Cost Tracking**: Monitor Gemini API usage and costs
- 📝 **Resume Management**: View and manage all resumes
- 🛡️ **Audit Logs**: Track all admin actions
- ⚙️ **System Settings**: Configure platform settings
- 📈 **Growth Metrics**: User growth, engagement rates
- 🎨 **Template Management**: Add/edit resume templates

### Super Admin vs Regular Admin:

| Feature               | Super Admin | Admin |
| --------------------- | ----------- | ----- |
| View Dashboard        | ✅          | ✅    |
| View Users            | ✅          | ✅    |
| Ban/Unban Users       | ✅          | ✅    |
| View Analytics        | ✅          | ✅    |
| **Promote Users**     | ✅          | ❌    |
| **Demote Admins**     | ✅          | ❌    |
| **Delete Users**      | ✅          | ❌    |
| **Change User Plans** | ✅          | ❌    |
| **System Settings**   | ✅          | ❌    |

## 🔐 Security Notes

⚠️ **Important Security Considerations:**

1. **Only promote trusted accounts** - Super admin has full platform access
2. **Keep at least 2 super admins** - Prevents lockout
3. **Monitor admin logs regularly** - Track all admin actions
4. **Use strong passwords** - Secure your Clerk account
5. **Enable 2FA on Clerk** - Additional security layer

## 🐛 Troubleshooting

### "User not found"

- Make sure you've signed up on the platform
- Check if Clerk webhook synced your user to MongoDB
- Verify your email or Clerk ID is correct

### "MONGODB_URI not found"

- Check `.env.local` file exists
- Verify `MONGODB_URI` is set correctly
- Restart your terminal

### "Cannot connect to MongoDB"

- Verify MongoDB is running (local or Atlas)
- Check connection string is correct
- Ensure IP is whitelisted (if using Atlas)

### Script doesn't run

```bash
# Make sure Node.js is installed
node --version

# Install dependencies if needed
npm install

# Try with full path
node C:/Users/hp/Desktop/ai-resume-v3/scripts/setup-superadmin.js your-email@example.com
```

## 🎉 After Setup

Once you're a super admin:

1. Sign in to your account
2. Navigate to `/admin` or click "Admin Panel" in navigation
3. You should see the full admin dashboard
4. Test your permissions by viewing users, stats, etc.

## 📞 Need Help?

If you encounter issues:

1. Check the console for error messages
2. Verify all prerequisites are met
3. Try the direct MongoDB method
4. Check Clerk dashboard to confirm your user exists

---

**Made with ❤️ for AI Resume Builder**
