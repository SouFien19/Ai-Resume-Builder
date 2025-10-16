# 🔗 Complete Webhook Setup Guide - Step by Step

## 📌 Quick Overview

You have 2 options:

1. **Local Testing with ngrok** (Do this NOW - takes 5 minutes)
2. **Production Deployment** (Do this LATER when ready to deploy)

---

## 🧪 Option 1: Local Testing with ngrok (START HERE)

### What is ngrok?

ngrok creates a secure tunnel from the internet to your localhost, giving you a public URL like `https://abc123.ngrok.io` that forwards to `http://localhost:3000`.

### Step 1: Sign up for ngrok (Free)

1. Go to: https://ngrok.com/
2. Click **"Sign up"** (it's free!)
3. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken

### Step 2: Authenticate ngrok

Open a **NEW** PowerShell terminal and run:

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Replace `YOUR_AUTH_TOKEN_HERE` with the token you copied.

### Step 3: Start ngrok

In the same terminal, run:

```powershell
ngrok http 3000
```

You'll see something like this:

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc1-23-45-67-89.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**✨ COPY THIS URL**: `https://abc1-23-45-67-89.ngrok-free.app`

⚠️ **IMPORTANT**: Keep this terminal window open! If you close it, ngrok stops.

### Step 4: Configure Clerk Webhook

Now let's set up Clerk to send webhooks to your ngrok URL:

#### 4.1: Go to Clerk Dashboard

1. Open browser: https://dashboard.clerk.com
2. **Sign in** to your Clerk account
3. **Select** your application (ResumeCraft AI or whatever you named it)

#### 4.2: Navigate to Webhooks

1. In the left sidebar, scroll down
2. Click **"Webhooks"**
3. Click **"+ Add Endpoint"** button (blue button, top right)

#### 4.3: Add Endpoint

You'll see a form. Fill it out:

**Endpoint URL**:

```
https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk
```

Example:

```
https://abc1-23-45-67-89.ngrok-free.app/api/webhooks/clerk
```

⚠️ Make sure to include `/api/webhooks/clerk` at the end!

**Description** (optional):

```
Local development webhook
```

#### 4.4: Select Events

Scroll down and select these events:

- ✅ **user.created** (When new user signs up)
- ✅ **user.updated** (When user updates profile)
- ✅ **user.deleted** (When user is deleted)

Click **"Create"** button

#### 4.5: Copy Signing Secret

After creating the endpoint, you'll see:

```
Signing Secret
whsec_abcdefghijklmnopqrstuvwxyz1234567890
```

**Click the copy icon** to copy this secret.

### Step 5: Add Secret to .env.local

1. Open your project in VS Code
2. Open (or create) the file: `.env.local` in the root directory
3. Add this line (paste your actual secret):

```bash
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

**Example**:

```bash
# Clerk Keys (already existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Add this NEW line:
CLERK_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890
```

4. **Save** the file

### Step 6: Restart Your Dev Server

**Stop your dev server** (Ctrl+C in the terminal running `npm run dev`)

Then start it again:

```bash
npm run dev
```

### Step 7: Test the Webhook! 🎉

Now let's test if it works:

#### Method A: Create a Test User in Clerk

1. Go to Clerk Dashboard → **Users**
2. Click **"+ Create User"** button
3. Fill in:
   - Email: `test@example.com`
   - Password: `Test123456!`
   - First name: `Test`
   - Last name: `User`
4. Click **"Create"**

#### Watch Your Terminal

In your VS Code terminal (where `npm run dev` is running), you should see:

```
[WEBHOOK] 📨 Received event: user.created
[2025-10-15T14:30:00.000Z] INFO: Connecting to MongoDB...
[2025-10-15T14:30:00.500Z] INFO: MongoDB connected successfully
[WEBHOOK] ✅ User created: user_2abc123xyz
```

✅ **If you see this, it's working!**

#### Check MongoDB

Your test user should now be in your MongoDB database with all the metadata.

---

## 🚀 Option 2: Production Deployment (Do This Later)

When you're ready to deploy to production, follow these steps:

### Step 1: Deploy to Vercel (or your hosting platform)

#### Using Vercel (Recommended):

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:

   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

6. **Environment Variables** - Add these:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   MONGODB_URI=mongodb+srv://...
   NEXT_PUBLIC_GEMINI_API_KEY=...
   REDIS_URL=...
   ```

7. Click **"Deploy"**

8. Wait for deployment to complete (2-3 minutes)

9. **Copy your production URL**: `https://your-app.vercel.app`

### Step 2: Configure Production Webhook in Clerk

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Click **Webhooks**
3. Click **"+ Add Endpoint"** again (for production)

4. Enter your production URL:

   ```
   https://your-app.vercel.app/api/webhooks/clerk
   ```

5. Select the same events:

   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted

6. Click **"Create"**

7. Copy the NEW **Signing Secret** (different from local!)

### Step 3: Add Production Secret to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:

   - **Name**: `CLERK_WEBHOOK_SECRET`
   - **Value**: `whsec_your_production_secret`
   - **Environment**: Production ✅

5. Click **"Save"**

### Step 4: Redeploy

1. In Vercel dashboard, go to **Deployments**
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment

### Step 5: Test Production Webhook

Create a new user on your production site and check the logs in Vercel:

1. Vercel Dashboard → Your Project → **Logs**
2. You should see the webhook logs there

---

## 🔍 Troubleshooting

### Issue: "Webhook verification failed"

**Cause**: Wrong signing secret

**Solution**:

1. Double-check the secret in `.env.local`
2. Make sure there are no extra spaces
3. Make sure it starts with `whsec_`
4. Restart dev server after adding it

### Issue: "ngrok session expired"

**Cause**: Free ngrok sessions expire after 2 hours

**Solution**:

1. Stop ngrok (Ctrl+C)
2. Start it again: `ngrok http 3000`
3. Copy the NEW URL (it changes each time)
4. Update the webhook URL in Clerk Dashboard

### Issue: "Can't see webhook logs"

**Solution**:

1. Make sure dev server is running (`npm run dev`)
2. Check you're looking at the correct terminal
3. Make sure ngrok is running and URL is correct in Clerk

### Issue: "User not appearing in MongoDB"

**Check**:

1. MongoDB connection string in `.env.local`
2. Webhook secret is correct
3. Check terminal for error messages
4. Look for `[WEBHOOK] ❌` in logs

---

## 📝 Quick Checklist

Use this checklist to make sure everything is set up:

### Local Development (ngrok):

- [ ] ngrok installed: `npm install -g ngrok`
- [ ] ngrok authenticated with your token
- [ ] ngrok running: `ngrok http 3000`
- [ ] Copied ngrok HTTPS URL
- [ ] Added endpoint in Clerk Dashboard
- [ ] Selected events: user.created, user.updated, user.deleted
- [ ] Copied signing secret from Clerk
- [ ] Added `CLERK_WEBHOOK_SECRET` to `.env.local`
- [ ] Restarted dev server
- [ ] Tested by creating a user
- [ ] Saw success logs in terminal

### Production (later):

- [ ] Deployed to Vercel/hosting
- [ ] Added production webhook endpoint in Clerk
- [ ] Copied production signing secret
- [ ] Added secret to Vercel environment variables
- [ ] Redeployed
- [ ] Tested on production site

---

## 🎯 Next Steps After Webhook Setup

Once webhooks are working:

1. **Run the migration script** to sync existing users:

   ```bash
   npx tsx scripts/migrate-roles-to-clerk.ts
   ```

2. **Set your first superadmin** (via Clerk Dashboard):

   - Go to Users → Select your user
   - Metadata tab → Add to Public Metadata:
     ```json
     { "role": "superadmin" }
     ```

3. **Test the auth flow**:
   - Sign in as superadmin → should go to `/admin`
   - Sign in as regular user → should go to `/dashboard`

---

## 💡 Pro Tips

1. **ngrok Web Interface**: Visit http://localhost:4040 to see all requests going through ngrok (great for debugging!)

2. **Keep ngrok running**: Don't close the ngrok terminal while developing

3. **Multiple developers**: Each developer needs their own ngrok URL

4. **Production vs Development**: Keep separate webhook endpoints in Clerk (one for ngrok, one for production)

5. **Security**: Never commit `.env.local` to git!

---

## 🆘 Need Help?

If you get stuck:

1. Check the ngrok web interface: http://localhost:4040
2. Check your dev server logs
3. Check Clerk Dashboard → Webhooks → View logs
4. Make sure all URLs are HTTPS (not HTTP)
5. Make sure webhook URL ends with `/api/webhooks/clerk`

---

**Ready to start?** Follow **Option 1** above! 🚀
