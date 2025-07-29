# Video Compression Guide

Your videos are too large for Cloud Run (161MB & 110MB). Here are solutions:

## Option 1: Compress Videos (Recommended)

### Using FFmpeg:
```bash
# Install ffmpeg if not already installed
# Windows: Download from https://ffmpeg.org/download.html
# Mac: brew install ffmpeg

# Compress to target ~20-30MB each:
ffmpeg -i client/public/assets/videos/scenario1/1.mp4 -vcodec h264 -acodec mp2 -crf 28 -preset fast client/public/assets/videos/scenario1/1_compressed.mp4

ffmpeg -i client/public/assets/videos/scenario1/2.mp4 -vcodec h264 -acodec mp2 -crf 28 -preset fast client/public/assets/videos/scenario1/2_compressed.mp4
```

### Using Online Tools:
- **CloudConvert.com** - Upload your videos, compress to ~20-30MB
- **Handbrake** - Free desktop tool with preset options

## Option 2: Use Google Cloud Storage

### Setup:
1. Create Cloud Storage bucket: `gsutil mb gs://alliancedemo-videos`
2. Upload videos: `gsutil cp videos/* gs://alliancedemo-videos/`
3. Make public: `gsutil iam ch allUsers:objectViewer gs://alliancedemo-videos`
4. Update video URLs in scenarios.js to: `https://storage.googleapis.com/alliancedemo-videos/1.mp4`

## Current Status:
- ✅ X.mp4 (35MB) - works fine
- ❌ 1.mp4 (161MB) - too large  
- ❌ 2.mp4 (110MB) - too large

**Recommended:** Compress videos to ~20-30MB each for best performance.

## Upload EndFrame Images to Cloud Storage

```bash
# Upload endFrame images to your Cloud Storage bucket
gsutil cp "client/public/assets/videos/scenario1/endFrame1.png" gs://alliance-demo-bucket/
gsutil cp "client/public/assets/videos/scenario1/endFrame2.png" gs://alliance-demo-bucket/

# Verify uploads
gsutil ls gs://alliance-demo-bucket/endFrame*.png
```