# 🎥 Visual Webhook Setup - Follow Along

## 🚀 Quick Start (5 Minutes)

### Step 1: Get ngrok Auth Token

1. **Open**: https://ngrok.com/
2. **Click**: "Sign up" button (top right)
3. **Sign up** with Google/GitHub/Email (free)
4. After signing up, you'll be redirected to: https://dashboard.ngrok.com/get-started/setup
5. **Copy** your authtoken (looks like: `2abc_defGHIjklMNOpqrSTUvwxYZ123456`)

### Step 2: Setup ngrok in PowerShell

Open a **NEW PowerShell** window and run:

```powershell
# Authenticate ngrok (paste your token)
ngrok config add-authtoken YOUR_TOKEN_HERE

# Start ngrok
ngrok http 3000
```

**You'll see**:

```
Session Status                online
Forwarding                    https://abc1-23-45.ngrok-free.app -> http://localhost:3000
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              COPY THIS URL!
```

**✨ Copy the HTTPS URL!**

### Step 3: Setup Clerk Webhook

1. **Open**: https://dashboard.clerk.com
2. **Sign in** to your account
3. **Click** on your app name
4. **Left sidebar** → Scroll down → Click "Webhooks"
5. **Click** the blue "+ Add Endpoint" button (top right)

### Step 4: Configure Endpoint

Fill in the form:

**Endpoint URL** (paste your ngrok URL + /api/webhooks/clerk):

```
https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk
```

**Example**:

```
https://abc1-23-45.ngrok-free.app/api/webhooks/clerk
```

**Description** (optional):

```
Local development webhook
```

**Scroll down** → Under "Subscribe to events":

Find and **CHECK** these 3 boxes:

- ☑️ **user.created**
- ☑️ **user.updated**
- ☑️ **user.deleted**

**Click** "Create" button (bottom)

### Step 5: Copy Signing Secret

After creating, you'll see a page with:

```
Signing Secret
whsec_abcd1234efgh5678ijkl9012mnop3456qrst7890
[📋 Copy icon]
```

**Click the copy icon** to copy the secret.

### Step 6: Add to .env.local

In VS Code:

1. Open (or create) `.env.local` in your project root
2. **Add** this line (paste your actual secret):

```bash
CLERK_WEBHOOK_SECRET=whsec_abcd1234efgh5678ijkl9012mnop3456qrst7890
```

3. **Save** the file (Ctrl+S)

### Step 7: Restart Dev Server

In your VS Code terminal:

1. **Stop** the server: Press `Ctrl+C`
2. **Start** again: `npm run dev`
3. Wait for "Ready in 2.3s"

### Step 8: Test It! 🎉

#### Create a Test User in Clerk:

1. Clerk Dashboard → **Users** (left sidebar)
2. Click **"+ Create User"** button
3. Fill in:
   ```
   Email: test@example.com
   Password: Test123456!
   First name: Test
   Last name: User
   ```
4. Click **"Create"**

#### Watch Your Terminal:

You should see:

```
[WEBHOOK] 📨 Received event: user.created
[WEBHOOK] ✅ User created: user_2abc123xyz
```

✅ **SUCCESS!** Your webhook is working!

---

## 🎬 What Just Happened?

```
You created user in Clerk
         ↓
Clerk sends webhook to: https://your-ngrok.ngrok-free.app/api/webhooks/clerk
         ↓
ngrok forwards to: http://localhost:3000/api/webhooks/clerk
         ↓
Your Next.js API receives it
         ↓
Verifies signature with CLERK_WEBHOOK_SECRET
         ↓
Creates user in MongoDB
         ↓
You see success log! ✅
```

---

## 📸 Clerk Dashboard Screenshots Guide

### Finding Webhooks:

**Clerk Dashboard → Left Sidebar:**

```
┌─────────────────────────┐
│ Overview                │
│ Users                   │
│ Organizations           │
│ Sessions                │
│ ▼ Configure             │
│   - API Keys            │
│   - Email & SMS         │
│   - Authentication      │
│   - Restrictions        │
│   - User & Authentication│
│ ▼ Integrations          │
│   - Webhooks       ← Click here!
│   - OAuth           │
└─────────────────────────┘
```

### Add Endpoint Page:

```
╔══════════════════════════════════════════╗
║  Create Endpoint                         ║
╠══════════════════════════════════════════╣
║                                          ║
║  Endpoint URL *                          ║
║  ┌────────────────────────────────────┐ ║
║  │ https://abc.ngrok-free.app/api/... │ ║
║  └────────────────────────────────────┘ ║
║                                          ║
║  Description (optional)                  ║
║  ┌────────────────────────────────────┐ ║
║  │ Local development webhook          │ ║
║  └────────────────────────────────────┘ ║
║                                          ║
║  Subscribe to events                     ║
║  ☑ user.created                          ║
║  ☑ user.updated                          ║
║  ☑ user.deleted                          ║
║  ☐ session.created                       ║
║  ☐ session.ended                         ║
║                                          ║
║              [Create]                    ║
╚══════════════════════════════════════════╝
```

### After Creating - Signing Secret:

```
╔══════════════════════════════════════════╗
║  Endpoint Details                        ║
╠══════════════════════════════════════════╣
║                                          ║
║  Signing Secret                          ║
║  whsec_abc123...xyz789          [📋]    ║
║                                          ║
║  ⚠️ This secret is shown only once!      ║
║  Copy it now to your .env.local file     ║
║                                          ║
╚══════════════════════════════════════════╝
```

---

## 🧪 Testing Checklist

After setup, verify:

- [ ] ngrok is running (don't close that terminal!)
- [ ] You see the HTTPS forwarding URL in ngrok
- [ ] Clerk webhook endpoint is created
- [ ] Webhook URL matches your ngrok URL + `/api/webhooks/clerk`
- [ ] All 3 events are selected (user.created, updated, deleted)
- [ ] Signing secret is in `.env.local`
- [ ] Dev server restarted after adding secret
- [ ] Test user created in Clerk
- [ ] Success log appeared in terminal
- [ ] User exists in MongoDB

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong: Missing `/api/webhooks/clerk`

```
https://abc.ngrok-free.app
```

### ✅ Correct: Include full path

```
https://abc.ngrok-free.app/api/webhooks/clerk
```

---

### ❌ Wrong: Using HTTP instead of HTTPS

```
http://abc.ngrok-free.app/api/webhooks/clerk
```

### ✅ Correct: Must use HTTPS

```
https://abc.ngrok-free.app/api/webhooks/clerk
```

---

### ❌ Wrong: Copying the wrong URL from ngrok

```
http://127.0.0.1:4040  ← This is ngrok's web interface
```

### ✅ Correct: Use the forwarding URL

```
https://abc.ngrok-free.app  ← This is your public URL
```

---

### ❌ Wrong: Spaces in the secret

```bash
CLERK_WEBHOOK_SECRET= whsec_abc123...
                     ^ space here!
```

### ✅ Correct: No spaces

```bash
CLERK_WEBHOOK_SECRET=whsec_abc123...
```

---

## 🔄 When ngrok Session Expires

Free ngrok sessions expire after **2 hours**. When it does:

### You'll see:

```
Session Expired
```

### To fix:

1. **Stop ngrok**: Ctrl+C in ngrok terminal
2. **Start again**: `ngrok http 3000`
3. **Copy the NEW URL** (it changes each time!)
4. **Update Clerk webhook**:
   - Clerk Dashboard → Webhooks
   - Click on your endpoint
   - Click "Edit"
   - Update the URL with new ngrok URL
   - Click "Save"

---

## 🎯 Quick Commands Summary

```powershell
# 1. Authenticate ngrok (once)
ngrok config add-authtoken YOUR_TOKEN

# 2. Start ngrok (every dev session)
ngrok http 3000

# 3. In another terminal - Start dev server
npm run dev

# 4. Test webhook by creating user in Clerk Dashboard
# Watch your npm run dev terminal for logs!
```

---

## 🌐 ngrok Web Interface

While ngrok is running, visit: **http://localhost:4040**

You'll see:

- All HTTP requests going through ngrok
- Request/response details
- Great for debugging webhook issues!

---

## ✅ Success Indicators

You know it's working when you see:

**In ngrok terminal**:

```
POST /api/webhooks/clerk 200 OK
```

**In dev server terminal**:

```
[WEBHOOK] 📨 Received event: user.created
[WEBHOOK] ✅ User created: user_2abc123
```

**In Clerk Dashboard** (Webhooks → Your endpoint → Logs):

```
✅ 200 OK - Delivered successfully
```

---

## 🎉 You're Done!

Once you see success logs, your webhook is working!

**Next steps**:

1. Keep ngrok running while developing
2. Run migration script to sync existing users
3. Test the new auth flow

See `AUTH_TESTING_GUIDE.md` for testing instructions!
