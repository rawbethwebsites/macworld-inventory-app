# Supabase Storage Setup for Product Images

This guide will help you set up Supabase Storage for uploading product images.

## 🪣 Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Fill in the details:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Check this (so images can be viewed without auth)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty or specify: `image/jpeg,image/png,image/webp,image/gif`
6. Click **Create bucket**

## 📋 Step 2: Update Products Table

You need to add an `image_url` column to your products table to store the image URLs.

### Go to SQL Editor and run this:

```sql
-- Add image_url column to products table
ALTER TABLE products 
ADD COLUMN image_url TEXT;

-- Optional: Add a comment to the column
COMMENT ON COLUMN products.image_url IS 'Public URL of the product image stored in Supabase Storage';
```

## 🔒 Step 3: Set Up Storage Policies (Public Access)

Since we made the bucket public, images can be viewed by anyone. But we still need policies for uploading and deleting.

### Go to SQL Editor and run this:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public read access (already handled by making bucket public)
-- But if you need explicit policy:
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

## 🌐 Alternative: Public Access for Development

If you want to allow anyone to upload (for development/testing only):

```sql
-- WARNING: This allows anyone to upload! Only use for development!
CREATE POLICY "Allow all uploads (dev only)"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow all deletes (dev only)"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');
```

## ✅ Step 4: Verify Setup

1. Go to **Storage** > **product-images** in Supabase dashboard
2. You should see the empty bucket
3. Try uploading a test image manually:
   - Click **Upload file**
   - Select an image
   - It should upload successfully

## 🧪 Step 5: Test in Your App

1. Make sure your dev server is running
2. Go to http://localhost:3000
3. Click **Add Product**
4. Fill in the form
5. Click **Choose Image** and select an image
6. You should see:
   - ✅ Image preview appears
   - ✅ File name and size shown
7. Click **Add Product**
8. You should see:
   - ✅ "Image uploaded successfully!" message
   - ✅ "Product added successfully!" message
   - ✅ Product appears in table with image

## 📁 Folder Structure in Storage

Images are stored in this structure:
```
product-images/
└── products/
    ├── 1234567890-abc123.jpg
    ├── 1234567891-def456.png
    └── 1234567892-ghi789.webp
```

## 🎨 Image Features in the App

### Upload Features:
- ✅ File type validation (JPG, PNG, WEBP, GIF)
- ✅ File size validation (max 5MB)
- ✅ Image preview before upload
- ✅ Remove image before submitting
- ✅ Unique filename generation
- ✅ Upload progress indication

### Display Features:
- ✅ Image thumbnails in product table (64x64px)
- ✅ Placeholder icon for products without images
- ✅ Fallback image on load error
- ✅ Responsive design

### Delete Features:
- ✅ Image deleted from storage when product is deleted
- ✅ Graceful handling if image deletion fails

## 🐛 Troubleshooting

### "The new row for relation violates check constraint"
- Make sure you added the `image_url` column to the products table
- Run the ALTER TABLE command from Step 2

### "new row violates row-level security policy for table 'objects'"
- Storage policies are missing or incorrect
- Run the policy creation SQL from Step 3
- Make sure your bucket is set to public

### "Failed to upload image"
- Check browser console for detailed error
- Verify bucket name is exactly `product-images`
- Check that policies allow INSERT operations
- Ensure image file is under 5MB

### Images not displaying
- Check that bucket is set to **Public**
- Verify the image_url is saved in the database
- Check browser console for 404 errors
- Try accessing the image URL directly in browser

### "Storage bucket not found"
- Make sure bucket name is exactly `product-images` (with hyphen)
- Bucket must be created in the same project

## 🔒 Production Security Recommendations

For production, you should:

1. **Require Authentication**:
   ```sql
   -- Remove public access policies
   DROP POLICY "Allow all uploads (dev only)" ON storage.objects;
   DROP POLICY "Allow all deletes (dev only)" ON storage.objects;
   ```

2. **Implement proper auth** in your app
3. **Add file size limits** in your bucket settings
4. **Restrict MIME types** to only images
5. **Add virus scanning** for uploaded files
6. **Implement rate limiting** to prevent abuse
7. **Use signed URLs** for sensitive images

## 📊 Updated Database Schema

Your products table now looks like this:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) CHECK (price IS NULL OR price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  image_url TEXT  -- NEW COLUMN
);
```

## 💡 Pro Tips

1. **Image Optimization**: Consider using Supabase Image Transformation for automatic resizing
2. **CDN**: Supabase Storage uses a CDN, so images load fast globally
3. **Lazy Loading**: Images in the table use browser-native lazy loading
4. **Caching**: Images are cached by browser for better performance
5. **Cleanup**: Consider adding a scheduled function to delete orphaned images

## 🎯 Next Steps

Once images are working, you can add:

1. **Multiple images per product** (create a separate table)
2. **Image gallery view** (lightbox/modal)
3. **Image editing** (crop, resize, filters)
4. **Drag-and-drop upload**
5. **Bulk image upload**
6. **Image compression** before upload
7. **Image alt text** for SEO

---

**Happy Uploading! 📸**

