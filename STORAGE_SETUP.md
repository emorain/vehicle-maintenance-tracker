# Supabase Storage Setup for Vehicle Images

## What is Supabase Storage?

Supabase Storage lets you store files (images, videos, etc.) securely. We'll use it to:
- Store vehicle photos taken with camera
- Store uploaded image files
- Generate public URLs automatically

---

## Setup Steps (5 minutes)

### Step 1: Create Storage Bucket

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** button
5. Fill in:
   - **Name**: `vehicle-images`
   - **Public bucket**: ✅ **CHECK THIS** (important!)
   - **File size limit**: 5 MB (or higher if you want)
   - **Allowed MIME types**: Leave blank (allows all images)
6. Click **"Create bucket"**

### Step 2: Set Storage Policies

After creating the bucket, set up security policies:

1. In **Storage**, click on the **`vehicle-images`** bucket
2. Click **"Policies"** tab at the top
3. Click **"New Policy"**

Create these 3 policies:

#### Policy 1: Allow Authenticated Users to Upload
- **Policy name**: `Authenticated users can upload vehicle images`
- **Policy definition**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: Leave blank
- **WITH CHECK expression**:
```sql
(bucket_id = 'vehicle-images')
```
- Click **Save**

#### Policy 2: Allow Public Read Access
- **Policy name**: `Anyone can view vehicle images`
- **Policy definition**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
```sql
(bucket_id = 'vehicle-images')
```
- Click **Save**

#### Policy 3: Allow Users to Delete Their Own Images
- **Policy name**: `Users can delete vehicle images`
- **Policy definition**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
(bucket_id = 'vehicle-images')
```
- Click **Save**

### Alternative: Quick SQL Setup

Or just run this SQL in **SQL Editor**:

```sql
-- Insert policies for vehicle-images bucket
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES
  (
    'Authenticated users can upload vehicle images',
    'vehicle-images',
    'INSERT',
    '(bucket_id = ''vehicle-images'')'
  ),
  (
    'Anyone can view vehicle images',
    'vehicle-images',
    'SELECT',
    '(bucket_id = ''vehicle-images'')'
  ),
  (
    'Users can delete vehicle images',
    'vehicle-images',
    'DELETE',
    '(bucket_id = ''vehicle-images'')'
  );
```

---

## Bucket Configuration

### Recommended Settings:
- **Public**: ✅ Yes (so images can be displayed publicly)
- **File size limit**: 5 MB (adjust based on your needs)
- **Allowed MIME types**: Leave empty for all image types

### Folder Structure:
Images will be organized by user:
```
vehicle-images/
  └── {user_id}/
      ├── vehicle-123-abc.jpg
      ├── vehicle-456-def.png
      └── vehicle-789-ghi.webp
```

---

## Verify Setup

### Test Upload (Optional)

1. Go to **Storage** → `vehicle-images` bucket
2. Click **"Upload file"** button
3. Upload a test image
4. Click on the image → Copy **Public URL**
5. Paste URL in browser - image should load ✅
6. Delete the test image

---

## What Happens Next

Once storage is set up, your app will:
1. Let users **take photos** with their camera (mobile)
2. Let users **select images** from their device
3. **Upload** images to Supabase Storage
4. **Store** the public URL in the database
5. **Display** images in vehicle cards

---

## Troubleshooting

### Can't create bucket
- Make sure you're on a Supabase plan that allows storage
- Free tier allows 1GB storage

### Upload fails with "policy violation"
- Check policies are created correctly
- Make sure user is authenticated
- Verify bucket is set to public

### Image URL not loading
- Check bucket is public
- Verify URL format: `https://{project}.supabase.co/storage/v1/object/public/vehicle-images/{path}`
- Check browser console for CORS errors

---

## Security Notes

- ✅ Bucket is public for **read** (so images display)
- ✅ Only authenticated users can **upload**
- ✅ Only authenticated users can **delete**
- ✅ Each user's images stored in their own folder
- ✅ File size limits prevent abuse

---

## Cost

Free tier includes:
- 1 GB storage
- 2 GB bandwidth per month
- More than enough for hundreds of vehicle photos!

Paid plans if you need more:
- Pro: $25/month (100GB storage + bandwidth)
