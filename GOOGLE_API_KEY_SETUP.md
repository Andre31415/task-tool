# Google Calendar API Key Setup

## Quick Setup (2 minutes)

You have Web OAuth credentials ✅, but you still need an API key.

### Create API Key

1. **Go to Google Cloud Console**:
   https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9

2. **Click "+ CREATE CREDENTIALS"** → **"API key"**

3. **Copy the API key** that appears

4. **Click "RESTRICT KEY"** (recommended):
   - Under "API restrictions" → Select "Restrict key"
   - Check ✅ "Google Calendar API"
   - Click "Save"

5. **Update your .env file**:
   ```bash
   cd "/Users/andrefarinazojr/Task Tool"
   nano .env
   ```
   
   Replace the `VITE_GOOGLE_API_KEY=` line with:
   ```
   VITE_GOOGLE_API_KEY=your-api-key-here
   ```

6. **Save** (Ctrl+O, Enter, Ctrl+X)

### Enable Google Calendar API

If not already enabled:

1. Go to: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=geometric-gamma-477021-t9
2. Click **"ENABLE"**

### Update Vercel

After creating the API key:

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your task-tool project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - Name: `VITE_GOOGLE_API_KEY`
   - Value: Your API key
5. **Redeploy** (Deployments → ⋮ → Redeploy)

---

## Current OAuth Configuration ✅

Your Web OAuth is properly configured:

- **Client ID**: `83152458775-6b5fkbf5dgk9m6i5tf8elpjf742l3unf.apps.googleusercontent.com`
- **Type**: Web application ✅
- **Authorized origins**: `http://localhost:5173` ✅

### Add Production URL

Once deployed to Vercel:

1. Get your Vercel URL: `https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app`
2. Go back to Google OAuth credentials
3. Add to **Authorized JavaScript origins**:
   ```
   https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app
   ```
4. Save

---

## Testing

After setup:

1. Open your app (local or Vercel)
2. Click hamburger menu (☰)
3. Click "Connect Google Calendar"
4. Authorize with your Google account
5. Your calendars should appear!

---

## Quick Reference

**Your Web OAuth Credentials**:
- Client ID: `83152458775-6b5fkbf5dgk9m6i5tf8elpjf742l3unf.apps.googleusercontent.com`
- Client Secret: `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` (not needed in .env)
- Type: Web application ✅
- Project: geometric-gamma-477021-t9

**Still Need**:
- API Key (follow steps above)

---

**Once you have the API key, Google Calendar will be fully integrated!** 📅

