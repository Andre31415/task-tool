# Google Calendar Integration Setup

## ⚠️ Important: Correct OAuth Configuration

Your current Google credentials are for an "installed" application type, but we need "Web application" OAuth credentials for this web app.

## Step-by-Step Setup

### 1. Go to Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9

### 2. Create OAuth 2.0 Web Application Credentials

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **"Web application"** as the Application type
3. Name it: "Task Manager Web App"
4. Add **Authorized JavaScript origins**:
   - For local development: `http://localhost:5173`
   - For production (Vercel): `https://your-app-name.vercel.app`
5. Add **Authorized redirect URIs**:
   - For local: `http://localhost:5173`
   - For production: `https://your-app-name.vercel.app`
6. Click **"CREATE"**

### 3. Get Your Credentials

After creating, you'll see:
- **Client ID**: Something like `xxxxx.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-xxxxx`

### 4. Enable Google Calendar API

1. Go to: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=geometric-gamma-477021-t9
2. Click **"ENABLE"**

### 5. Create API Key

1. Go back to: https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the API key
4. (Recommended) Click **"RESTRICT KEY"**:
   - Under "API restrictions", select "Restrict key"
   - Check "Google Calendar API"
   - Click "Save"

### 6. Update Environment Variables

#### For Local Development

Create/update `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://lqcjlfphzjokwbsaejur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY2psZnBoempva3dic2FlanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzE5NzYsImV4cCI6MjA3NTY0Nzk3Nn0.rfEy8NkXaQ-KdRT9SMDIGYyeXwuhQyjck7uo1suvR-M
VITE_GOOGLE_CLIENT_ID=your-new-web-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-new-api-key-here
```

#### For Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `VITE_SUPABASE_URL`: `https://lqcjlfphzjokwbsaejur.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: (your Supabase anon key)
   - `VITE_GOOGLE_CLIENT_ID`: (your new web client ID)
   - `VITE_GOOGLE_API_KEY`: (your new API key)

### 7. Restart Dev Server

After updating `.env`:

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### 8. Test Google Calendar Integration

1. Open your app: http://localhost:5173
2. Login with your username and password
3. Click the hamburger menu (☰) in the top-right
4. Click **"Connect Google Calendar"**
5. Sign in with your Google account
6. Grant permissions
7. Your Google Calendar events should appear!

### 9. Create Recurring Tasks with Calendar Sync

1. Create or edit a task
2. Click the rounded attribute box below the title
3. Check **"Recurring Task"**
4. Select repeat pattern (Daily/Weekly/Monthly/Annually)
5. Optionally set an end date
6. Check **"Add to Google Calendar"**
7. Click **"Save"**

The recurring task will be synced to your Google Calendar with the recurrence pattern!

## Troubleshooting

### "Origin not allowed" Error

- Make sure you added `http://localhost:5173` to "Authorized JavaScript origins" in Google Cloud Console
- For production, add your Vercel URL

### "Invalid Client ID" Error

- Verify you're using the **Web application** client ID, not the "installed" one
- Check that the client ID is correctly pasted in `.env`

### Calendar Not Connecting

- Ensure Google Calendar API is enabled
- Check that API key is correct
- Try clearing browser cache and cookies
- Check browser console for errors

### Recurring Tasks Not Syncing

- Make sure you checked "Add to Google Calendar" when creating the recurring task
- Verify you're connected to Google Calendar (check if calendar sidebar shows your events)
- Check that the task has a date set

## Current Status

✅ Supabase Database: Configured
✅ Task Tables: Created
✅ Password Authentication: Enabled
✅ Recurring Tasks: Implemented
❓ Google Calendar: Needs web OAuth credentials

## Next Steps

1. ✅ Create new OAuth web credentials (follow steps above)
2. ✅ Update `.env` with new credentials
3. ✅ Restart dev server
4. ✅ Test Google Calendar connection
5. ✅ Test recurring task sync

---

**Note**: The credentials in your downloaded file are for "installed" applications (desktop/mobile apps). Web applications require different OAuth credentials with JavaScript origins.

