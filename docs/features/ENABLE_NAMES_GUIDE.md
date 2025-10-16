# 📝 Enable First Name & Last Name in Sign-Up

## ✅ What Was Done (Code Changes)

1. **Updated Sign-Up Page** (`src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`)

   - Added styling configuration to SignUp component
   - Added `unsafeMetadata` to signal name requirement

2. **Enhanced Sync API** (`src/app/api/sync-user/route.ts`)
   - Already captures `firstName` and `lastName` from Clerk
   - Now also updates names on every login (if user changes them in Clerk)
   - Builds full name: `firstName + lastName`

## 🎯 Required: Configure Clerk Dashboard

**You MUST do this to see the name fields:**

### Step-by-Step Instructions:

1. **Open Clerk Dashboard**

   - Go to: https://dashboard.clerk.com
   - Select your application: **Ai-Resume-Builder**

2. **Navigate to Settings**

   - In left sidebar, click: **User & Authentication**
   - Click: **Email, Phone, Username**

3. **Enable Name Fields**

   - Scroll down to **"Personal Information"** section
   - Find **First name** field:
     - Click the dropdown
     - Select: **"Required"** (not "Optional" or "Hidden")
   - Find **Last name** field:
     - Click the dropdown
     - Select: **"Required"**

4. **Save Changes**

   - Scroll to bottom of page
   - Click **Save** button

5. **Test Sign-Up**
   - Go to: http://localhost:3000/sign-up
   - You should now see:
     - ✅ First name field
     - ✅ Last name field
     - ✅ Email field
     - ✅ Password field

---

## 📋 Field Configuration Options in Clerk

| Field            | Recommended Setting | Description                           |
| ---------------- | ------------------- | ------------------------------------- |
| **First name**   | Required            | User must enter first name to sign up |
| **Last name**    | Required            | User must enter last name to sign up  |
| **Email**        | Required            | Already required (default)            |
| **Password**     | Required            | Already required (default)            |
| **Username**     | Optional            | Not needed for resume builder         |
| **Phone number** | Hidden              | Not needed for resume builder         |

---

## 🔍 Verify It's Working

After enabling in Clerk Dashboard:

1. **Sign Up Form** should show:

   ```
   First name: [_____________]
   Last name:  [_____________]
   Email:      [_____________]
   Password:   [_____________]
   ```

2. **Check Database** after sign-up:

   ```bash
   node scripts/list-users.js
   ```

   You should see:

   ```
   1. soufianelabiadh@gmail.com
      Clerk ID: user_xxxxx
      First Name: Soufiane
      Last Name: Labiadh
      Username: null
      Role: user
   ```

3. **Check Logs** during sign-up:
   ```
   [SYNC] Creating new user: user_xxxxx
   [SYNC] ✅ User created successfully
   ```

---

## 🎨 Customization (Optional)

If you want to customize the form appearance further:

```tsx
<SignUp
  path="/sign-up"
  routing="path"
  signInUrl="/sign-in"
  afterSignUpUrl="/dashboard"
  appearance={{
    elements: {
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
      formFieldInput: "rounded-lg border-gray-300",
      footerActionLink: "text-blue-600 hover:text-blue-700",
    },
  }}
/>
```

---

## ❓ Troubleshooting

### Problem: Name fields not showing

**Solution**: Make sure you saved changes in Clerk Dashboard

### Problem: Names not saved to MongoDB

**Solution**: Check terminal logs for `[SYNC]` messages

### Problem: Existing users have no names

**Solution**: They will be updated on next login (auto-sync updates profile)

---

## 🚀 Next Steps

After enabling names:

1. ✅ Test sign-up with your email (soufianelabiadh@gmail.com)
2. ✅ Verify names appear in database
3. ✅ Promote yourself to super admin: `node scripts/setup-superadmin.js soufianelabiadh@gmail.com`
4. ✅ Access admin dashboard at: http://localhost:3000/admin

---

**Remember**: Changes in Clerk Dashboard may take a few seconds to apply. Refresh the sign-up page if needed.
