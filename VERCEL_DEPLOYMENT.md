# Vercel Deployment Guide

## Prerequisites

✅ All TypeScript errors fixed
✅ Supabase database configured
✅ Environment variables ready
✅ `vercel.json` configuration created

## Quick Deploy

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd "/Users/andrefarinazojr/Task Tool"
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy: **Yes**
   - Which scope: Select your account
   - Link to existing project: **No**
   - Project name: **task-manager** (or your choice)
   - Directory: **./** (current directory)
   - Override settings: **No**

5. **Set Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Paste: https://lqcjlfphzjokwbsaejur.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY
   # Paste your Supabase anon key
   
   vercel env add VITE_GOOGLE_CLIENT_ID
   # Paste your Google web client ID
   
   vercel env add VITE_GOOGLE_API_KEY
   # Paste your Google API key
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com/new

2. **Import Git Repository**:
   - If your code is on GitHub/GitLab:
     - Click "Import Project"
     - Select your repository
     - Vercel will auto-detect Vite

3. **Configure Project**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL = https://lqcjlfphzjokwbsaejur.supabase.co
   VITE_SUPABASE_ANON_KEY = (your key)
   VITE_GOOGLE_CLIENT_ID = (your web client ID)
   VITE_GOOGLE_API_KEY = (your API key)
   ```

5. **Deploy**: Click "Deploy"

## Post-Deployment Steps

### 1. Update Google OAuth Settings

After deployment, you'll get a URL like: `https://task-manager-xyz.vercel.app`

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://task-manager-xyz.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `https://task-manager-xyz.vercel.app`
5. Click **"Save"**

### 2. Test Your Deployment

Visit your Vercel URL and test:

- ✅ Login/Registration
- ✅ Create tasks
- ✅ Add recurring tasks
- ✅ Timer functionality
- ✅ Voice input (requires HTTPS - Vercel provides this)
- ✅ Google Calendar connection
- ✅ Real-time sync (open in two tabs)
- ✅ All views (List, Day, Week, Month)

### 3. Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Google OAuth settings with custom domain

## Automatic Deployments

Once set up with Git:

- **Every push to main branch** → Automatic production deployment
- **Every push to other branches** → Preview deployment
- Vercel will build and deploy automatically

## Build Verification

Before deploying, verify locally:

```bash
npm run build
npm run preview
```

Open http://localhost:4173 to test the production build.

## Environment Variables in Vercel

To update environment variables after deployment:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Edit variables
5. **Important**: Redeploy after changing variables:
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Build Fails

**Check TypeScript errors**:
```bash
npm run build
```

All errors should be fixed now, but if new ones appear:
- Check imports use `type` keyword for types
- Ensure all dependencies are in `package.json`

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check Vercel build logs for errors

### Google Calendar Not Working

- Add production URL to Google OAuth authorized origins
- Use web application credentials (not installed app)
- Check browser console for errors

### Real-Time Sync Issues

- Verify Supabase URL is correct
- Check Supabase real-time quotas
- Ensure WebSocket connections aren't blocked

## Monitoring

### Vercel Analytics (Free)

Add Vercel Analytics to track usage:

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Analytics
3. Install package:
   ```bash
   npm install @vercel/analytics
   ```
4. Add to `src/main.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   // Add <Analytics /> to your app
   ```

### Performance Monitoring

- Vercel provides automatic performance insights
- Check "Speed Insights" in dashboard
- Monitor Core Web Vitals

## Costs

### Vercel Free Tier Includes:

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Custom domains

### Supabase Free Tier Includes:

- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth

**Total Monthly Cost**: $0 for personal use!

## Production Checklist

Before going live:

- [ ] All TypeScript errors fixed
- [ ] Environment variables set in Vercel
- [ ] Google OAuth updated with production URL
- [ ] Supabase storage bucket created
- [ ] Test login/registration
- [ ] Test task creation
- [ ] Test recurring tasks
- [ ] Test Google Calendar sync
- [ ] Test on mobile devices
- [ ] Check performance with Lighthouse
- [ ] Set up custom domain (optional)

## Deployment URL

After deployment, your app will be available at:

```
https://your-app-name.vercel.app
```

Share this URL with users!

---

**Your task manager is production-ready!** 🚀

For support, check:
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
- Supabase Docs: https://supabase.com/docs

