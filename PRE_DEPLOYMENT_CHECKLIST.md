# Pre-Deployment Checklist

Before deploying to Vercel, make sure you've completed all these steps:

## ✅ Supabase Database Setup

### 1. Vehicles Table
- [ ] Run SQL from RLS_SETUP.md
- [ ] Table `vehicles` created with all columns (including color, license_plate, mileage)
- [ ] RLS policies created for vehicles table
- [ ] Test: Can create, read, update, and delete vehicles

### 2. Maintenance Records Table
- [ ] Run SQL from MAINTENANCE_SETUP.md
- [ ] Table `maintenance_records` created
- [ ] RLS policies created for maintenance_records table
- [ ] Test: Can add maintenance records to a vehicle

### 3. Protocols Tables
- [ ] Run SQL from PROTOCOLS_SETUP.md - Step 1 (Create Tables)
- [ ] Run SQL from PROTOCOLS_SETUP.md - Step 2 (RLS Policies)
- [ ] Run SQL from PROTOCOLS_SETUP.md - Step 3 (Default Protocols)
- [ ] Tables `maintenance_protocols` and `vehicle_protocols` created
- [ ] Test: Can view protocols at `/protocols` page

### 4. Storage Bucket
- [ ] Run SQL from STORAGE_SETUP.md
- [ ] Bucket `vehicle_images` created
- [ ] Bucket set to "Public"
- [ ] Storage RLS policies created
- [ ] Test: Can upload vehicle images

## ✅ Environment Variables

Make sure your `.env` file has:
- [ ] `VITE_SUPABASE_URL=your_url_here`
- [ ] `VITE_SUPABASE_ANON_KEY=your_key_here`

## ✅ Local Testing

Test all features locally before deploying:
- [ ] Authentication: Sign up, login, logout, forgot password
- [ ] Vehicles: Create, edit, delete, upload image
- [ ] Maintenance: Add, edit, delete maintenance records
- [ ] Protocols: View defaults, create custom protocol
- [ ] Protocol Assignment: Assign protocol to vehicle
- [ ] Dashboard: Shows vehicles and maintenance reminders
- [ ] Navigation: All links work correctly

## ✅ Git Repository

- [ ] All files committed to git
- [ ] `.env` is in `.gitignore` (NOT committed)
- [ ] `vercel.json` exists for SPA routing
- [ ] Code pushed to GitHub

## ✅ Vercel Configuration

When deploying to Vercel:
- [ ] Environment variables added in Vercel dashboard
- [ ] Build settings are correct (Vite auto-detected)
- [ ] Deployment successful
- [ ] Live site is accessible

## ✅ Post-Deployment Testing

After deploying to Vercel:
- [ ] Can access the live site
- [ ] Can sign up/login
- [ ] Can create a vehicle
- [ ] Can upload an image
- [ ] Can add maintenance records
- [ ] Can assign protocols
- [ ] Dashboard shows correct data
- [ ] No console errors in browser

## ✅ Supabase Post-Deployment Config

- [ ] Add Vercel URL to Supabase Authentication settings:
  - Go to Supabase Dashboard → Authentication → URL Configuration
  - Add Site URL: `https://your-app.vercel.app`
  - Add Redirect URL: `https://your-app.vercel.app/**`

## Common Issues

**Issue**: "new row violates row-level security policy"
- **Fix**: Make sure all RLS policies are created in Supabase

**Issue**: Images won't upload
- **Fix**: Check storage bucket exists, is public, and has RLS policies

**Issue**: Protocol features not working
- **Fix**: Make sure you ran all 3 steps in PROTOCOLS_SETUP.md

**Issue**: Authentication redirects fail
- **Fix**: Add your Vercel URL to Supabase authentication redirect URLs

**Issue**: Build fails on Vercel
- **Fix**: Run `npm run build` locally to check for TypeScript errors

## Ready to Deploy?

Once all checkboxes are checked:
1. Follow DEPLOYMENT.md for step-by-step instructions
2. Deploy to Vercel
3. Test all features on the live site
4. Share your app!
