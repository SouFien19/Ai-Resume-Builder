# 🎉 ngrok is Running! - Next Steps

## ✅ What You've Done So Far:

1. ✅ Installed ngrok
2. ✅ Authenticated with your token
3. ✅ Started ngrok on port 3000

---

## 👀 What You Should See Now

A **new PowerShell window** opened with ngrok running. It should look like this:

```
ngrok

Session Status                online
Account                       your-email (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc1-23-45-67-89.ngrok-free.app -> http://localhost:3000
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              👆 THIS IS YOUR PUBLIC URL - COPY IT!

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

---

## 📋 STEP 1: Copy Your ngrok URL

Look for the line that says **"Forwarding"** and copy the HTTPS URL.

**Example**: `https://abc1-23-45-67-89.ngrok-free.app`

⚠️ **IMPORTANT**:

- Copy the **HTTPS** URL (not HTTP)
- Do NOT include the `-> http://localhost:3000` part
- Just copy: `https://your-unique-id.ngrok-free.app`

---

## 🔗 STEP 2: Configure Clerk Webhook

### 2.1: Open Clerk Dashboard

Go to: https://dashboard.clerk.com

### 2.2: Navigate to Webhooks

1. Sign in to your Clerk account
2. Select your application
3. Click **"Webhooks"** in the left sidebar
4. Click **"+ Add Endpoint"** button (blue button, top right)

### 2.3: Fill in the Form

**Endpoint URL**: Paste your ngrok URL and add `/api/webhooks/clerk`:

```
https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk
```

**Example**:

```
https://abc1-23-45-67-89.ngrok-free.app/api/webhooks/clerk
```

⚠️ Make sure to include `/api/webhooks/clerk` at the end!

**Description** (optional):

```
Local development webhook
```

### 2.4: Select Events

Scroll down and check these boxes:

- ✅ **user.created**
- ✅ **user.updated**
- ✅ **user.deleted**

### 2.5: Create Endpoint

Click the **"Create"** button at the bottom.

---

## 🔐 STEP 3: Copy Signing Secret

After creating the endpoint, Clerk will show you a **Signing Secret**.

It looks like: `whsec_abcdefghijklmnopqrstuvwxyz1234567890`

**Click the copy icon** 📋 to copy it.

---

## 📝 STEP 4: Add Secret to .env.local

1. In VS Code, open (or create) the file: `.env.local` in your project root
2. Add this line (paste your actual secret):

```bash
CLERK_WEBHOOK_SECRET=whsec_paste_your_secret_here
```

**Your .env.local should look like**:

```bash
# Existing Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Add this NEW line:
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_from_clerk
```

3. **Save** the file (Ctrl+S)

---

## 🔄 STEP 5: Restart Dev Server

In your VS Code terminal:

1. **Stop** the server if running (Ctrl+C)
2. **Start** it again:
   ```bash
   npm run dev
   ```
3. Wait for: `✓ Ready in 2.3s`

---

## 🧪 STEP 6: Test the Webhook!

### Create a Test User in Clerk:

1. Go to Clerk Dashboard → **Users** (left sidebar)
2. Click **"+ Create User"** button
3. Fill in:
   ```
   Email: webhook-test@example.com
   Password: Test123456!
   First name: Webhook
   Last name: Test
   ```
4. Click **"Create"**

### Watch Your VS Code Terminal:

You should see logs like:

```
[WEBHOOK] 📨 Received event: user.created
[2025-10-15T14:30:00.000Z] INFO: Connecting to MongoDB...
[2025-10-15T14:30:00.500Z] INFO: MongoDB connected successfully
[WEBHOOK] ✅ User created: user_2abc123xyz
```

✅ **If you see this, it's working perfectly!**

---

## 🎯 Quick Checklist

Use this to track your progress:

- [ ] ngrok window is open and showing "Session Status: online"
- [ ] Copied the HTTPS forwarding URL from ngrok
- [ ] Opened Clerk Dashboard
- [ ] Created new webhook endpoint
- [ ] Pasted ngrok URL + `/api/webhooks/clerk`
- [ ] Selected all 3 events (user.created, updated, deleted)
- [ ] Clicked "Create"
- [ ] Copied the signing secret
- [ ] Added `CLERK_WEBHOOK_SECRET` to `.env.local`
- [ ] Saved `.env.local`
- [ ] Restarted dev server (`npm run dev`)
- [ ] Created test user in Clerk
- [ ] Saw success logs in terminal ✅

---

## 🌐 Bonus: ngrok Web Interface

While ngrok is running, you can visit:

**http://localhost:4040**

This shows:

- All requests going through ngrok
- Request/response details
- Great for debugging!

---

## ⚠️ Important Notes

1. **Keep ngrok window open**: If you close it, ngrok stops working
2. **URL changes**: Each time you restart ngrok, you get a new URL
3. **Free tier**: Sessions expire after 2 hours (just restart ngrok)
4. **Two servers**: You need BOTH running:
   - ngrok (in its own window)
   - npm run dev (in VS Code terminal)

---

## 🆘 Troubleshooting

### Can't find ngrok URL?

Look for the line with **"Forwarding"** and **"https://"**

### ngrok window closed?

Restart it:

```bash
ngrok http 3000
```

Then update the URL in Clerk Dashboard.

### Webhook not working?

1. Check ngrok is running
2. Check URL in Clerk includes `/api/webhooks/clerk`
3. Check secret is in `.env.local` with no spaces
4. Restart dev server
5. Check ngrok web interface: http://localhost:4040

---

## ✅ Success!

Once you see the webhook success logs, you're done with this step!

**Next**:

1. Keep ngrok running while developing
2. Run migration script: `npx tsx scripts/migrate-roles-to-clerk.ts`
3. Test the improved auth flow!

See `AUTH_TESTING_GUIDE.md` for full testing instructions.

---

**Need help?** Check:

- `WEBHOOK_VISUAL_GUIDE.md` for step-by-step visual guide
- `WEBHOOK_SETUP_COMPLETE_GUIDE.md` for detailed instructions
- ngrok web interface: http://localhost:4040
