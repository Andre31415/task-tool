# ⚠️ CRITICAL: Google OAuth Configuration Issue

## The Problem

Your current OAuth credentials are:
- **Type**: Desktop client
- **Client ID**: `83152458775-pr1knrdpbhp3jopc3luhd51fnosb99r8.apps.googleusercontent.com`

**This WILL NOT work for a web application!**

Desktop/Installed app credentials cannot be used in web browsers due to CORS and security restrictions.

## The Solution

You have 2 options:

### Option 1: Create New Web Application Credentials (Recommended - 5 min)

1. **Go to Google Cloud Console**:
   https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9

2. **Keep your existing Desktop client** (don't delete it)

3. **Click "+ CREATE CREDENTIALS"** → **"OAuth client ID"**

4. **Configure**:
   - Application type: **Web application**
   - Name: `Task Manager Web`
   
5. **Add Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```

6. **Add Authorized redirect URIs**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```

7. **Click CREATE**

8. **Copy the new Client ID** (it will be different from your desktop one)

9. **Update your .env file** with the NEW web client ID

### Option 2: Use Without Google Calendar (Quick - 1 min)

The app works perfectly without Google Calendar! You can:
- Still use recurring tasks
- Just can't sync to Google Calendar
- Everything else works 100%

To skip Google Calendar:
- Leave `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY` empty in .env
- App will work without calendar integration

## Why Desktop Credentials Won't Work

**Technical Explanation**:

Desktop OAuth is designed for:
- Native applications (desktop apps, mobile apps)
- localhost redirect URIs only
- No origin restrictions

Web OAuth is designed for:
- Browser-based applications
- Public URLs with HTTPS
- CORS-enabled origins

**What happens if you try to use Desktop credentials**:
```
Error: Origin http://localhost:5173 not allowed
Error: redirect_uri_mismatch
Error: idpiframe_initialization_failed
```

## Current Status

- ✅ Your desktop credentials work for desktop apps
- ❌ Your desktop credentials DON'T work for web apps
- ✅ All other features work perfectly
- ⏳ Need web credentials for Google Calendar in browser

## Quick Decision

**Want Google Calendar integration?**
→ Follow Option 1 (create web credentials)

**Don't need Google Calendar right now?**
→ Follow Option 2 (deploy without it, add later)

**Note**: You can always add Google Calendar later! The app is fully functional without it.

## After Creating Web Credentials

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://lqcjlfphzjokwbsaejur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY2psZnBoempva3dic2FlanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzE5NzYsImV4cCI6MjA3NTY0Nzk3Nn0.rfEy8NkXaQ-KdRT9SMDIGYyeXwuhQyjck7uo1suvR-M
VITE_GOOGLE_CLIENT_ID=your-new-web-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key-here
```

Then restart: `npm run dev`

---

**Bottom Line**: Desktop OAuth ≠ Web OAuth. You need web credentials for Vercel deployment.

