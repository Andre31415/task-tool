# Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- ✅ Supabase project set up with all tables
- ✅ Supabase storage bucket created (`task-attachments`)
- ✅ Environment variables configured
- ✅ (Optional) Google Calendar API credentials
- ✅ Application tested locally

## Environment Variables

Your hosting platform needs these environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id (optional)
VITE_GOOGLE_API_KEY=your-google-api-key (optional)
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Vite applications.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd "/Users/andrefarinazojr/Task Tool"
   vercel
   ```

3. **Add Environment Variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to "Settings" → "Environment Variables"
   - Add all four environment variables

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration (vercel.json)

Create `vercel.json` in the project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

Netlify is another excellent option with great CI/CD support.

#### Steps:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd "/Users/andrefarinazojr/Task Tool"
   netlify deploy --prod
   ```

4. **Add Environment Variables:**
   - Go to Netlify dashboard
   - Select your site
   - Go to "Site settings" → "Build & deploy" → "Environment"
   - Add all environment variables

#### Netlify Configuration (netlify.toml)

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: GitHub Pages

Free hosting option for static sites.

#### Steps:

1. **Install gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

2. **Update package.json:**
   Add to scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Update vite.config.ts:**
   ```typescript
   export default defineConfig({
     base: '/Task-Tool/', // Replace with your repo name
     // ... rest of config
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Environment Variables:**
   - GitHub Pages doesn't support server-side env vars
   - You'll need to hardcode values or use a different solution
   - Consider using Vercel or Netlify instead

### Option 4: Docker

For self-hosting or cloud platforms like AWS, GCP, Azure.

#### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_API_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build and Run:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=your-url \
  --build-arg VITE_SUPABASE_ANON_KEY=your-key \
  -t task-manager .

docker run -p 80:80 task-manager
```

## Post-Deployment Steps

### 1. Update Google OAuth

If using Google Calendar integration:

1. Go to Google Cloud Console
2. Navigate to your OAuth credentials
3. Add your production URL to "Authorized JavaScript origins"
4. Example: `https://your-app.vercel.app`

### 2. Test All Features

After deployment, test:

- ✅ Login with username
- ✅ Create tasks
- ✅ Voice input (requires HTTPS)
- ✅ OCR upload
- ✅ Timer functionality
- ✅ Drag and drop
- ✅ Calendar integration
- ✅ Real-time sync (open in two tabs)

### 3. Configure Custom Domain (Optional)

#### Vercel:
1. Go to project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

#### Netlify:
1. Go to site settings
2. Navigate to "Domain management"
3. Add custom domain
4. Configure DNS

### 4. Enable HTTPS

Both Vercel and Netlify provide automatic HTTPS. For custom hosting:

- Use Let's Encrypt for free SSL certificates
- Configure your web server (nginx/Apache) for HTTPS
- Redirect HTTP to HTTPS

### 5. Set Up Analytics (Optional)

Add analytics to track usage:

**Google Analytics:**
1. Create GA4 property
2. Add tracking code to `index.html`

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

Add to `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In your App component:
<Analytics />
```

## Performance Optimization

### 1. Enable Compression

Both Vercel and Netlify do this automatically. For custom hosting:

**nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. Configure Caching

Add cache headers for static assets:

**Vercel (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Monitor Performance

- Use Lighthouse to audit performance
- Check Core Web Vitals
- Monitor Supabase usage/quotas

## Scaling Considerations

### Database

- Supabase free tier: 500MB database, 1GB file storage
- Upgrade to Pro if needed ($25/month)
- Consider database indexes for large datasets

### File Storage

- Limit file upload sizes in the UI
- Implement file cleanup for deleted tasks
- Monitor storage usage in Supabase dashboard

### API Rate Limits

- Google Calendar API has quotas
- Implement rate limiting if needed
- Cache calendar data where possible

## Monitoring & Logging

### Supabase Logs

- Monitor in Supabase dashboard under "Logs"
- Set up alerts for errors
- Review API usage regularly

### Application Errors

Add error tracking (optional):

**Sentry:**
```bash
npm install @sentry/react
```

Initialize in `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

## Backup Strategy

### Database Backup

Supabase automatically backs up your database. To export manually:

1. Go to Supabase dashboard
2. Navigate to "Database"
3. Use "Backups" to create manual backups

### Code Backup

- Push code to GitHub/GitLab
- Enable automatic backups on your hosting platform
- Keep environment variables in a secure password manager

## Troubleshooting Production Issues

### Voice Input Not Working
- Ensure site is served over HTTPS
- Check browser compatibility
- Verify microphone permissions

### Real-Time Sync Issues
- Check Supabase real-time quotas
- Verify WebSocket connections aren't blocked
- Review firewall/proxy settings

### Performance Issues
- Check Supabase query performance
- Review network waterfall in DevTools
- Optimize large file uploads
- Enable proper caching

### Google Calendar Not Loading
- Verify OAuth credentials
- Check authorized domains
- Review API quotas in Google Cloud Console

## Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables not in code
- ✅ Supabase RLS policies enabled
- ✅ File upload size limits configured
- ✅ Content Security Policy headers (optional)
- ✅ Regular dependency updates

## Maintenance

### Regular Tasks

- **Weekly**: Check error logs
- **Monthly**: Review Supabase usage and costs
- **Quarterly**: Update dependencies (`npm update`)
- **Yearly**: Review and renew SSL certificates (if self-hosting)

### Updating the Application

1. Make changes locally
2. Test thoroughly
3. Commit to git
4. Deploy:
   ```bash
   vercel --prod
   # or
   netlify deploy --prod
   ```

---

## Quick Deploy Commands

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Docker:**
```bash
docker build -t task-manager . && docker push your-registry/task-manager
```

---

Your task management application is now production-ready! 🚀

