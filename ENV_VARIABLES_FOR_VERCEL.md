# Environment Variables for Vercel

## ✅ Copy-Paste These Exact Values into Vercel

Go to: https://vercel.com/dashboard (your project) → Settings → Environment Variables

---

### Variable 1: VITE_SUPABASE_URL

**Name:**
```
VITE_SUPABASE_URL
```

**Value:**
```
https://lqcjlfphzjokwbsaejur.supabase.co
```

**Environment**: Production, Preview, Development

---

### Variable 2: VITE_SUPABASE_ANON_KEY

**Name:**
```
VITE_SUPABASE_ANON_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY2psZnBoempva3dic2FlanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzE5NzYsImV4cCI6MjA3NTY0Nzk3Nn0.rfEy8NkXaQ-KdRT9SMDIGYyeXwuhQyjck7uo1suvR-M
```

**Environment**: Production, Preview, Development

---

### Variable 3: VITE_GOOGLE_CLIENT_ID

**Name:**
```
VITE_GOOGLE_CLIENT_ID
```

**Value:**
```
83152458775-6b5fkbf5dgk9m6i5tf8elpjf742l3unf.apps.googleusercontent.com
```

**Environment**: Production, Preview, Development

---

### Variable 4: VITE_GOOGLE_API_KEY

**Name:**
```
VITE_GOOGLE_API_KEY
```

**Value:**
```
AIzaSyBfbj_E1pJNLrWDHpXW8Jp9DVJtP-gJ9yI
```

*Note: You'll need to create an API key in Google Cloud Console if you haven't already*

**Environment**: Production, Preview, Development

---

## Important: After Adding Variables

1. **Save** all variables
2. Go to **Deployments** tab
3. Click the **three dots** (⋮) on latest deployment
4. Click **Redeploy**
5. Check **"Use existing build cache"** → NO
6. Click **Redeploy**

This ensures your app rebuilds with the new environment variables.

---

## Google Calendar API Key Creation

If you don't have an API key yet:

1. Go to: https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9
2. Click "+ CREATE CREDENTIALS" → "API key"
3. Copy the key
4. Click "RESTRICT KEY"
5. Under "API restrictions" → Select "Restrict key"
6. Check "Google Calendar API"
7. Click "Save"
8. Use this key for `VITE_GOOGLE_API_KEY`

---

## Verification

After redeploying with environment variables:

1. Visit: https://task-tool-p0nyr9iwn-andre-8bdfa351.vercel.app
2. Open browser DevTools → Console
3. Check for errors
4. Try connecting Google Calendar

All environment variables should load correctly!

