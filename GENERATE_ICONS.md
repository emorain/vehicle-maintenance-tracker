# Generating App Icons for Upshift

The SVG icon has been created at `/public/icon.svg`. To complete the PWA setup, you need to generate PNG icons.

## Quick Method (Online Tool)

1. Go to https://realfavicongenerator.net/
2. Upload `/public/icon.svg`
3. Download the generated package
4. Extract and place these files in `/public/`:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `apple-touch-icon.png` (180x180)
   - `favicon.ico`

## Alternative: Using ImageMagick (if installed)

```bash
# Convert SVG to PNG sizes
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
```

## Temporary Placeholders

For now, the app will work without the PNG files, but iOS/Android won't be able to install it as a PWA until these are generated.
