# Update Google OAuth for Vercel Deployment

## ⚠️ CRITICAL: Add Vercel URL to Google OAuth

Your Vercel URL is: `https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app`

You MUST add this to your Google OAuth configuration or Google Calendar won't work on production.

## Quick Update (1 minute)

1. **Go to Google Cloud Console**:
   https://console.cloud.google.com/apis/credentials/oauthclient/83152458775-6b5fkbf5dgk9m6i5tf8elpjf742l3unf.apps.googleusercontent.com?project=geometric-gamma-477021-t9

2. **Click "EDIT OAUTH CLIENT"** (or the pencil icon)

3. **Under "Authorized JavaScript origins"**, add:
   ```
   https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app
   ```
   
   You should now have:
   - `http://localhost:5173` (already there ✅)
   - `https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app` (add this)

4. **Under "Authorized redirect URIs"**, add (if field exists):
   ```
   https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app
   ```

5. **Click "SAVE"**

6. **Wait 5 minutes** for changes to propagate

---

## Verification

After updating and waiting 5 minutes:

1. Visit: https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app
2. Login to your account
3. Click hamburger menu (☰)
4. Click "Connect Google Calendar"
5. Authorize with your Google account
6. ✅ Your calendars should appear!

---

## Current Configuration ✅

**Your Web OAuth Client**:
- Client ID: `83152458775-6b5fkbf5dgk9m6i5tf8elpjf742l3unf.apps.googleusercontent.com`
- Type: Web application ✅
- Current origins: `http://localhost:5173` ✅

**Need to Add**:
- `https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app`

---

**This is essential for Google Calendar to work on your deployed app!**

