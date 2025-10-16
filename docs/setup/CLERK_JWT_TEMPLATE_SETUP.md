# 🔐 Clerk JWT Template Setup

## Problem

The middleware can't read the user's role because Clerk doesn't include `publicMetadata` in the session token by default.

**Current sessionClaims**:

```json
{
  "azp": "http://localhost:3000",
  "exp": 1760554380,
  "sub": "user_346pBWGPp58dnHRjWA5INPgvrtr"
  // ❌ No publicMetadata!
}
```

**What we need**:

```json
{
  "azp": "http://localhost:3000",
  "exp": 1760554380,
  "sub": "user_346pBWGPp58dnHRjWA5INPgvrtr",
  "metadata": {
    "role": "superadmin" // ✅ This!
  }
}
```

## Setup Steps

### 1. Go to Clerk Dashboard

🔗 https://dashboard.clerk.com/

### 2. Select Your Application

Click on **"top-louse-33"** (your app)

### 3. Navigate to Sessions

- Left sidebar → Click **"Sessions"**
- Then click **"Customize session token"**

### 4. Edit the Session Token Template

Replace the default template with this:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

**Or if you want to be more specific** (recommended):

```json
{
  "metadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
```

### 5. Save the Template

- Click **"Save"** or **"Apply changes"**
- Wait 2-3 seconds for changes to propagate

### 6. Force New Session

Back in your browser:

1. **Sign out** from your app
2. **Close the browser tab completely**
3. **Open a new tab**
4. Go to: `http://localhost:3000/sign-in`
5. **Sign in again**

### 7. Verify It Works

After signing in, you should see in the terminal:

```
[MIDDLEWARE] 🔍 sessionClaims: {
  ...
  "metadata": {
    "role": "superadmin"
  }
}
[MIDDLEWARE] 🔍 User user_346pBWGPp58dnHRjWA5INPgvrtr has role: superadmin
```

And you'll be **automatically redirected to `/admin`**! 🎉

---

## Quick Reference

**Clerk Dashboard Path**:
Dashboard → Your App → Sessions → Customize session token

**Template to add**:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

**Test command** (to verify role in Clerk):

```bash
npx tsx --env-file=.env.local scripts/check-clerk-user.ts
```

---

## Why This Is Needed

By default, Clerk's session tokens (JWTs) only include basic claims like:

- `sub` (user ID)
- `sid` (session ID)
- `iss` (issuer)
- `exp` (expiration)

**But NOT user metadata!**

To include custom data like `role` from `publicMetadata`, you must configure a **custom session token template**.

This tells Clerk: _"Hey, also include the user's public metadata in every JWT token you issue!"_

Once configured, the middleware can read the role directly from the JWT without querying the database. ⚡
