# Deployment Checklist for Vercel

## ✅ Pre-Deployment Verification

This checklist ensures your Task Manager will work perfectly on Vercel.

---

## 1. Environment Variables Setup

### Local Development (.env file)

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://lqcjlfphzjokwbsaejur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY2psZnBoempva3dic2FlanVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzE5NzYsImV4cCI6MjA3NTY0Nzk3Nn0.rfEy8NkXaQ-KdRT9SMDIGYyeXwuhQyjck7uo1suvR-M
VITE_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-google-api-key
```

### Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://lqcjlfphzjokwbsaejur.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | (your Supabase anon key) | Production, Preview |
| `VITE_GOOGLE_CLIENT_ID` | (your web client ID) | Production, Preview |
| `VITE_GOOGLE_API_KEY` | (your Google API key) | Production, Preview |

---

## 2. Google Calendar OAuth Configuration

### ⚠️ CRITICAL: Create Web Application OAuth Credentials

Your current credentials are for "installed" applications. You MUST create new credentials:

#### Steps:

1. **Go to Google Cloud Console**:
   ```
   https://console.cloud.google.com/apis/credentials?project=geometric-gamma-477021-t9
   ```

2. **Create OAuth 2.0 Client ID**:
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "Task Manager Production"

3. **Add Authorized JavaScript origins**:
   - Local: `http://localhost:5173`
   - Production: `https://your-app.vercel.app` (replace with actual URL)

4. **Add Authorized redirect URIs**:
   - Local: `http://localhost:5173`
   - Production: `https://your-app.vercel.app`

5. **Copy credentials**:
   - Client ID: Copy to `.env` and Vercel
   - Client Secret: (not needed for web apps, but keep secure)

6. **Enable Google Calendar API**:
   ```
   https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=geometric-gamma-477021-t9
   ```
   Click "ENABLE"

7. **Create API Key**:
   - Create new API key
   - Restrict to Google Calendar API
   - Copy to `.env` and Vercel

---

## 3. Database Verification

### Supabase Tables (All Created ✅)

- [x] `tm_users` (with password_hash)
- [x] `tm_tasks` (with recurring fields)
- [x] `tm_attachments`
- [x] `tm_user_preferences`
- [x] `tm_task_history`

### Storage Bucket

- [x] Bucket name: `task-attachments`
- [x] Set to Public or configure RLS

---

## 4. Build Verification

Test local build before deploying:

```bash
cd "/Users/andrefarinazojr/Task Tool"
npm run build
```

Should complete without errors.

Test preview:

```bash
npm run preview
```

Open http://localhost:4173 and test all features.

---

## 5. Git & GitHub Setup

```bash
cd "/Users/andrefarinazojr/Task Tool"

# Initialize git
git init

# Add GitHub remote
git remote add origin https://github.com/Andre31415/task-tool.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete task manager with recurring tasks and password auth"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 6. Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Go to: https://vercel.com/new
2. Import from GitHub: `Andre31415/task-tool`
3. Framework: **Vite** (auto-detected)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variables (see section 1)
7. Click "Deploy"

### Option B: Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts and add environment variables.

---

## 7. Post-Deployment Tasks

### A. Update Google OAuth

After deployment, you'll get URL like: `https://task-manager-xyz.vercel.app`

1. Go to Google Cloud Console credentials
2. Edit your OAuth client
3. Add to Authorized JavaScript origins:
   - `https://task-manager-xyz.vercel.app`
4. Add to Authorized redirect URIs:
   - `https://task-manager-xyz.vercel.app`
5. Save

### B. Test Production Deployment

Visit your Vercel URL and test:

- [ ] Registration with password
- [ ] Login with credentials
- [ ] Create tasks
- [ ] Add recurring tasks
- [ ] Timer functionality
- [ ] Voice input (HTTPS required - Vercel provides)
- [ ] OCR upload
- [ ] Google Calendar connection
- [ ] Real-time sync (two tabs)
- [ ] All views work
- [ ] Mobile responsive

---

## 8. Feature Testing Checklist

### Authentication
- [ ] Register new account
- [ ] Login existing account
- [ ] Logout
- [ ] Session persistence

### Task Management
- [ ] Create task manually
- [ ] Create task via voice
- [ ] Create task via OCR
- [ ] Edit task attributes
- [ ] Delete task
- [ ] Restore deleted task
- [ ] Complete task
- [ ] Restore completed task

### Recurring Tasks
- [ ] Create daily recurring task
- [ ] Create weekly recurring task
- [ ] Create monthly recurring task
- [ ] Create annual recurring task
- [ ] Set end date
- [ ] Enable "Add to Calendar"
- [ ] Verify sync to Google Calendar

### Subtasks
- [ ] Add subtask
- [ ] Verify duration aggregates to parent
- [ ] Complete subtask
- [ ] Timer on subtask

### Timer
- [ ] Start timer (turns RED)
- [ ] Pause timer
- [ ] Resume timer
- [ ] Timer persists on refresh
- [ ] Multiple timers simultaneously

### Views
- [ ] List view
- [ ] Day view
- [ ] Week view - drag tasks to days
- [ ] Month view - drag tasks to days
- [ ] Completed tasks view
- [ ] Deleted tasks view

### Calendar Integration
- [ ] Open calendar sidebar
- [ ] Connect Google Calendar
- [ ] View Google events
- [ ] Toggle calendar visibility
- [ ] Drag task to calendar date
- [ ] Recurring task syncs to Google

### Real-Time Sync
- [ ] Open two browser tabs
- [ ] Login same account
- [ ] Changes in tab 1 → appear in tab 2
- [ ] Changes in tab 2 → appear in tab 1

---

## 9. Performance Checks

### Lighthouse Audit

Run in Chrome DevTools:
- Performance: Target 90+
- Accessibility: Target 90+
- Best Practices: Target 90+
- SEO: Target 90+

### Load Times
- Initial load: < 3s
- Task creation: < 500ms
- Real-time update: < 1s

---

## 10. Security Verification

- [ ] Passwords are hashed (SHA-256)
- [ ] `.env` in `.gitignore`
- [ ] No API keys in code
- [ ] HTTPS enforced (Vercel automatic)
- [ ] Supabase RLS enabled
- [ ] CORS properly configured

---

## 11. Documentation Checklist

- [x] README.md - Features and usage
- [x] SETUP.md - Installation guide
- [x] FEATURES.md - Complete feature list
- [x] DEPLOYMENT.md - Vercel deployment
- [x] GOOGLE_CALENDAR_SETUP.md - OAuth setup
- [x] SUPABASE_SETUP_COMPLETE.md - Database config
- [x] FINAL_SETUP_SUMMARY.md - Overview
- [x] DEPLOYMENT_CHECKLIST.md - This file

---

## 12. Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployment status
- Check build logs if issues
- View analytics (if enabled)
- Monitor function invocations

### Supabase Dashboard
- Monitor database size
- Check real-time connections
- Review storage usage
- Monitor API requests

### Google Cloud Console
- Monitor API quota usage
- Check OAuth consent screen
- Review API key restrictions

---

## 🚀 Quick Deploy Commands

```bash
# Verify everything builds
npm run build

# Test production build locally
npm run preview

# Push to GitHub
git push

# Deploy to Vercel
vercel --prod
```

---

## 🆘 Common Issues & Solutions

### Build Fails
**Solution**: Run `npm run build` locally to see errors
- All TypeScript errors are fixed ✅
- Check for missing dependencies

### Environment Variables Not Working
**Solution**: 
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Clear Vercel cache: Settings → General → Clear Cache

### Google Calendar Not Connecting
**Solution**:
- Use Web application OAuth (not installed)
- Add production URL to authorized origins
- Wait 5-10 minutes for Google changes to propagate

### Real-Time Sync Not Working
**Solution**:
- Check Supabase real-time is enabled
- Verify connection in browser DevTools → Network → WS
- Check Supabase Dashboard → Real-time

### Recurring Tasks Not Syncing
**Solution**:
- Connect Google Calendar first
- Ensure task has a date
- Check "Add to Calendar" is enabled
- Verify Google API key is valid

---

## ✅ Deployment Success Criteria

Your deployment is successful when:

1. ✅ App loads at Vercel URL
2. ✅ Can register and login
3. ✅ Can create and manage tasks
4. ✅ Recurring tasks work
5. ✅ Google Calendar connects
6. ✅ Real-time sync works across devices
7. ✅ All views render correctly
8. ✅ Mobile responsive
9. ✅ No console errors
10. ✅ All features from checklist work

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Google Calendar API**: https://developers.google.com/calendar/api/guides/overview
- **Vite Docs**: https://vitejs.dev/guide/

---

**Your app is production-ready!** Follow this checklist and everything will work perfectly on Vercel. 🚀

