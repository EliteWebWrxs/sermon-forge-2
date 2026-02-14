# Storage Configuration for SermonForge

## File Size Limits

SermonForge uses Supabase Storage for file uploads. The file size limits depend on your Supabase plan:

### Supabase Free Tier
- **Maximum file size:** 50MB per file
- **Total storage:** 500MB

### Supabase Pro Tier
- **Maximum file size:** Configurable (up to 500MB+)
- **Total storage:** 100GB included

## Increasing File Size Limits

### Option 1: Update via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click on the **sermons** bucket
4. Click **Edit bucket**
5. Set **File size limit** to your desired limit (e.g., 524288000 for 500MB)
6. Click **Save**

### Option 2: Run Migration

Run the migration file to update the storage bucket limits:

```bash
supabase db push
```

This will apply the migration in `supabase/migrations/20240214000000_update_storage_limits.sql`

**Note:** Large file limits (>50MB) require Supabase Pro plan.

## Handling Large Video Files

If you frequently work with large video files (>100MB), consider these options:

### 1. Video Compression
Use tools to compress your videos before uploading:
- **HandBrake** (Free, cross-platform)
- **FFmpeg** command line tool
- Online tools like CloudConvert

Example FFmpeg compression:
```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 1000k -b:a 128k output.mp4
```

### 2. Audio Extraction
For transcription purposes, you only need audio. Extract audio from video:

```bash
ffmpeg -i video.mp4 -vn -acodec mp3 -ab 128k audio.mp3
```

This will significantly reduce file size.

### 3. Use YouTube Links
Instead of uploading large videos:
1. Upload your sermon to YouTube (can be unlisted)
2. Use the YouTube URL option in SermonForge
3. SermonForge will transcribe directly from YouTube

### 4. Upgrade to Supabase Pro
- **Cost:** $25/month
- **Benefits:**
  - 100GB storage
  - Higher file size limits
  - Better performance
  - Priority support

## Current Configuration

The app is currently configured to:
- Accept files up to 100MB in the UI
- Show a warning for files over 50MB (free tier limit)
- Suggest compression for large files

## Troubleshooting

### "The object exceeded the maximum allowed size" Error

This error means your file is larger than the bucket's configured limit:

1. **Check file size:** Right-click the file → Properties/Get Info
2. **Check your Supabase plan:** Free tier = 50MB max
3. **Solutions:**
   - Compress the file
   - Extract audio only
   - Use YouTube upload method
   - Upgrade to Supabase Pro

### Upload Fails Without Error

1. Check browser console for network errors
2. Verify you're authenticated
3. Check Supabase Storage dashboard for errors
4. Ensure the 'sermons' bucket exists and is public

## Support

For issues related to:
- **Storage limits:** Contact Supabase support or upgrade your plan
- **App functionality:** Check GitHub issues or create a new one
- **Video compression:** See compression tools documentation above
