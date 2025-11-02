# Vercel Quick Deploy Guide

## Prerequisites

✅ Project pushed to GitHub: https://github.com/Andre31415/task-tool

## Deploy to Vercel (3 Easy Steps)

### Step 1: Go to Vercel

Visit: https://vercel.com/new

### Step 2: Import from GitHub

1. Click "Import Git Repository"
2. Find and select: `Andre31415/task-tool`
3. Click "Import"

### Step 3: Configure & Deploy

**Framework Preset**: Vite (auto-detected)

**Root Directory**: `./`

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Environment Variables**: Click "Add" and enter these:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://lqcjlfphzjokwbsaejur.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY2psZnBoempva3dic2FlanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzE5NzYsImV4cCI6MjA3NTY0Nzk3Nn0.rfEy8NkXaQ-KdRT9SMDIGYyeXwuhQyjck7uo1suvR-M` |
| `VITE_GOOGLE_CLIENT_ID` | (your web client ID - see below) |
| `VITE_GOOGLE_API_KEY` | (your API key - see below) |

**Click "Deploy"** 🚀

---

## ⚠️ Important: Google Calendar Setup

### Your Current Credentials Won't Work!

Your downloaded credentials are for "installed" apps. Web apps need different credentials.

### Create Web Application OAuth Credentials

1. **Go to Google Cloud Console**:
   ```
   https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9
   ```

2. **Create OAuth 2.0 Client ID**:
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Type: **Web application** (NOT Desktop/Installed)
   - Name: "Task Manager Web"

3. **Add Authorized JavaScript origins**:
   - `http://localhost:5173` (for testing)
   - `https://your-app.vercel.app` (after deployment)

4. **Add Authorized redirect URIs**:
   - `http://localhost:5173`
   - `https://your-app.vercel.app`

5. **Copy Client ID** → Add to Vercel environment variables

6. **Enable Google Calendar API**:
   ```
   https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=geometric-gamma-477021-t9
   ```
   Click "ENABLE"

7. **Create API Key**:
   - "+ CREATE CREDENTIALS" → "API key"
   - Restrict to Google Calendar API
   - Copy → Add to Vercel environment variables

---

## Post-Deployment

### 1. Get Your Vercel URL

After deployment completes, you'll get a URL like:
```
https://task-tool-xyz.vercel.app
```

### 2. Update Google OAuth

Go back to Google Cloud Console → OAuth credentials:

Add your Vercel URL to:
- Authorized JavaScript origins
- Authorized redirect URIs

Save changes.

### 3. Test Your App

Visit your Vercel URL and test:

- ✅ Registration with password
- ✅ Login
- ✅ Create tasks
- ✅ Recurring tasks
- ✅ Timer functionality
- ✅ Voice input
- ✅ Google Calendar connection
- ✅ Real-time sync (open two tabs)

---

## Automatic Deployments

Every push to `main` branch will automatically deploy to production!

Every push to other branches creates preview deployments.

---

## Environment Variables (Copy-Paste Ready)

For Vercel dashboard, use these exact values:

### VITE_SUPABASE_URL
```
https://lqcjlfphzjokwbsaejur.supabase.co
```

### VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY2psZnBoempva3dic2FlanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzE5NzYsImV4cCI6MjA3NTY0Nzk3Nn0.rfEy8NkXaQ-KdRT9SMDIGYyeXwuhQyjck7uo1suvR-M
```

### VITE_GOOGLE_CLIENT_ID
```
(your NEW web client ID from Google Cloud Console)
```

### VITE_GOOGLE_API_KEY
```
(your API key from Google Cloud Console)
```

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- All TypeScript errors are already fixed ✅

### Can't Connect to Supabase
- Verify environment variables are set
- Check variable names start with `VITE_`

### Google Calendar Not Working
- Ensure you created **Web application** OAuth (not installed)
- Add Vercel URL to authorized origins
- Wait 5-10 minutes for Google changes to propagate

---

## Success! 🎉

Your task manager is now live on Vercel!

**Share your URL and start managing tasks!**

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/Andre31415/task-tool
- **Supabase Dashboard**: https://app.supabase.com/project/lqcjlfphzjokwbsaejur
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9

