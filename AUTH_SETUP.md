# Authentication Setup Guide

## What's Implemented

Your app now has a complete email/password authentication system with:

✅ **Sign Up** - Create account with email and password
✅ **Email Verification** - Users must verify email before logging in
✅ **Sign In** - Login with email and password
✅ **Forgot Password** - Password reset via email
✅ **Password Validation** - Minimum 6 characters with at least one number
✅ **Toast Notifications** - User-friendly error/success messages
✅ **Auto-switching** - Smooth transitions between login/signup/reset modes

---

## Supabase Configuration Required

You need to configure Supabase to enable email/password auth. Follow these steps:

### Step 1: Enable Email/Password Authentication

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Email** provider
5. Make sure it's **enabled** (toggle should be ON)

### Step 2: Configure Email Verification

1. In the same **Authentication** section, go to **Settings**
2. Scroll to **Email Auth**
3. Enable **Confirm email** (this is CRITICAL!)
4. Set the confirmation email template if you want to customize it

### Step 3: Configure Email Templates (Optional but Recommended)

Go to **Authentication** → **Email Templates** and customize:

#### **Confirm signup**
This email is sent when users create an account:
```
Subject: Confirm Your Email - Vehicle Maintenance Tracker

Hi there!

Thanks for signing up for Vehicle Maintenance Tracker!

Click the link below to verify your email address:

{{ .ConfirmationURL }}

If you didn't create an account, you can safely ignore this email.

Best regards,
Vehicle Maintenance Tracker Team
```

#### **Reset password**
This email is sent when users click "Forgot Password":
```
Subject: Reset Your Password - Vehicle Maintenance Tracker

Hi there!

We received a request to reset your password.

Click the link below to choose a new password:

{{ .ConfirmationURL }}

If you didn't request this, you can safely ignore this email.

Best regards,
Vehicle Maintenance Tracker Team
```

### Step 4: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:5173` (for development)
3. When you deploy to production, update this to your production URL

### Step 5: Add Redirect URLs

1. In **Authentication** → **URL Configuration**
2. Add **Redirect URLs**:
   - `http://localhost:5173`
   - `http://localhost:5173/**` (wildcard for all routes)
   - When you deploy, add your production URLs too

---

## How It Works

### **Signup Flow:**
1. User enters email and password (must match confirmation)
2. Password validated (6+ chars, 1+ number)
3. Supabase sends verification email
4. User clicks link in email → account verified
5. User can now log in

### **Login Flow:**
1. User enters email and password
2. If email not verified → error message prompts to check email
3. If credentials correct → logged in, redirected to Dashboard

### **Forgot Password Flow:**
1. User clicks "Forgot Password?"
2. Enters email address
3. Supabase sends password reset email
4. User clicks link → redirected to app to set new password
5. User can log in with new password

---

## Testing the System

### Test Signup:
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Enter email and password (e.g., `test@example.com` / `password123`)
4. You should see: "Success! Check your email to verify your account."
5. Check your email inbox (might be in spam!)
6. Click the verification link

### Test Login:
1. After verifying, go back to http://localhost:5173
2. Enter your email and password
3. Click "Sign In"
4. You should be logged in and see the Dashboard

### Test Forgot Password:
1. On login screen, click "Forgot Password?"
2. Enter your email
3. Check email for reset link
4. Click link and set new password
5. Log in with new password

---

## Common Issues & Solutions

### "Email not confirmed" error
**Cause:** User didn't click verification link yet
**Solution:** Check email (including spam folder) and click verification link

### Email not arriving
**Cause:** Supabase email rate limiting or spam filters
**Solutions:**
- Wait a few minutes and try again
- Check spam folder
- Configure custom SMTP in Supabase (Production → Settings → Auth → SMTP Settings)

### "Invalid login credentials"
**Cause:** Wrong email or password
**Solution:** Use "Forgot Password" to reset

### Redirect not working after email verification
**Cause:** Site URL not configured correctly
**Solution:** Ensure Site URL in Supabase matches your app URL exactly

---

## Production Deployment Checklist

When you deploy to production:

- [ ] Update Supabase Site URL to production domain
- [ ] Add production domain to Redirect URLs
- [ ] Configure custom SMTP for reliable email delivery
- [ ] Test all flows (signup, login, forgot password) on production
- [ ] Update email templates with production branding

---

## Password Requirements

Current requirements (enforced in code):
- Minimum 6 characters
- At least one number

You can modify these in `AuthForm.tsx:16-19` if you want stricter requirements.

---

## Need Help?

If you run into issues:
1. Check browser console for errors
2. Check Supabase dashboard → Authentication → Logs
3. Verify all configuration steps above
4. Make sure `.env` has correct Supabase URL and keys
