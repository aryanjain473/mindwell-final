# Demo Video Directory

## How to Add Your Demo Video

1. **Place your MP4 file here:**
   - File name: `demo.mp4`
   - Location: `public/videos/demo.mp4`
   - The video path is already configured in the code

2. **Video Requirements:**
   - **Format**: MP4 (H.264 codec recommended)
   - **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
   - **Duration**: 2-5 minutes recommended
   - **File Size**: Under 50MB for faster loading
   - **Aspect Ratio**: 16:9 (standard widescreen)

3. **That's it!** 
   - The "Watch Demo" button on the landing page will automatically use your video
   - No code changes needed - just place the file here

## Current Setup

The video modal is configured to look for: `/videos/demo.mp4`

This means your file should be at: `public/videos/demo.mp4`

## Testing

1. Place your `demo.mp4` file in this directory
2. Start your development server: `npm run dev`
3. Go to the landing page
4. Click "Watch Demo" button
5. Your video should play in the modal!

## Troubleshooting

- **Video doesn't play?** Check the browser console for errors
- **File too large?** Compress your video using online tools like:
  - https://www.freeconvert.com/video-compressor
  - https://www.youcompress.com/
- **Wrong format?** Convert to MP4 using:
  - https://cloudconvert.com/
  - https://www.freeconvert.com/video-converter
