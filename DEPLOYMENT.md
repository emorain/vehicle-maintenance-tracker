# Deployment Guide - Vercel

This guide will walk you through deploying your Vehicle Maintenance Tracker to Vercel.

## Prerequisites

1. A [GitHub](https://github.com) account
2. A [Vercel](https://vercel.com) account (you can sign up with GitHub)
3. Your Supabase project URL and anon key

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `vehicle-maintenance-tracker`)
3. **Important**: Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push Code to GitHub

Copy the commands from your new GitHub repository page, or use these (replace YOUR_USERNAME and YOUR_REPO):

```bash
cd "C:\Users\emora\Projects\maintenance-tracker\vehicle-maintenance-tracker"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Find and select your `vehicle-maintenance-tracker` repository
5. Vercel will auto-detect it as a Vite project
6. **IMPORTANT**: Before clicking Deploy, add your environment variables:

### Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value | Where to Find |
|------|-------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API |

7. Click **"Deploy"**
8. Wait for the build to complete (usually 2-3 minutes)
9. Click on the deployment URL to view your live site!

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
cd "C:\Users\emora\Projects\maintenance-tracker\vehicle-maintenance-tracker"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? vehicle-maintenance-tracker
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Step 4: Verify Deployment

1. Visit your deployment URL (e.g., `https://vehicle-maintenance-tracker.vercel.app`)
2. Test the authentication (sign up/login)
3. Create a test vehicle
4. Upload an image
5. Create a maintenance record
6. Assign a protocol
7. Check the dashboard for reminders

## Troubleshooting

### Build Errors

If the build fails, check:
- All environment variables are set correctly
- No TypeScript errors (run `npm run build` locally first)
- All dependencies are in `package.json`

### Runtime Errors

If the app builds but doesn't work:
- Check browser console for errors
- Verify environment variables are set in Vercel dashboard
- Ensure Supabase URL and keys are correct
- Check Supabase RLS policies are set up

### Authentication Not Working

- Verify environment variables are correct
- Check Supabase Dashboard → Authentication → URL Configuration
- Add your Vercel domain to "Site URL" and "Redirect URLs" in Supabase:
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs: `https://your-app.vercel.app/**`

### Images Not Uploading

- Verify storage bucket `vehicle_images` exists in Supabase
- Check storage RLS policies are set up (see STORAGE_SETUP.md)
- Ensure bucket is set to "Public" in Supabase Storage settings

## Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically rebuild and deploy your changes!

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Update Supabase redirect URLs to include your custom domain

## Important Notes

- **Database Setup**: Make sure you've run all the SQL scripts:
  - RLS_SETUP.md (for vehicles table)
  - STORAGE_SETUP.md (for image storage)
  - MAINTENANCE_SETUP.md (for maintenance_records table)
  - PROTOCOLS_SETUP.md (for protocols system)

- **Environment Variables**: Never commit your `.env` file! Always set environment variables in Vercel dashboard.

- **Preview Deployments**: Every branch you push creates a preview deployment. Main branch is production.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console errors
3. Verify Supabase connection
4. Check RLS policies are correctly set up
