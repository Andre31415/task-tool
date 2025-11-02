# Task Manager Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- (Optional) Google Cloud Console account for Calendar integration

## Step 1: Install Dependencies

```bash
cd "/Users/andrefarinazojr/Task Tool"
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### 2.2 Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the SQL schema from `src/lib/supabase.ts` (the `SCHEMA_SQL` constant)
5. Paste it into the SQL editor and run it

This will create all necessary tables:
- `users`
- `tasks`
- `attachments`
- `user_preferences`
- `task_history`

### 2.3 Set Up Storage Bucket

1. In Supabase dashboard, go to "Storage"
2. Create a new bucket called `task-attachments`
3. Set it to "Public" (or configure appropriate policies)

### 2.4 Get API Credentials

1. Go to "Settings" → "API" in your Supabase dashboard
2. Copy your:
   - Project URL
   - Anon/Public key

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id (optional)
VITE_GOOGLE_API_KEY=your-google-api-key (optional)
```

**Important:** Replace the values with your actual Supabase credentials.

## Step 4: (Optional) Set Up Google Calendar Integration

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the "Google Calendar API"

### 4.2 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen if prompted
4. Select "Web application" as application type
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (if deploying)
6. Copy the Client ID

### 4.3 Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Restrict the key to "Google Calendar API" (recommended)
4. Copy the API key

### 4.4 Add to Environment

Update your `.env` file with:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_GOOGLE_API_KEY=your-api-key-here
```

## Step 5: Run the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Step 6: First Login

1. Open the application in your browser
2. Enter any username (no password needed)
3. Start creating tasks!

## Features to Test

### Basic Task Management
- ✅ Create tasks with title and description
- ✅ Add duration, date, and tags
- ✅ Drag and drop to reorder
- ✅ Click duration to start timer

### Voice Input
- ✅ Click floating microphone button
- ✅ Speak your task
- ✅ Test headphone button (Ctrl+H to simulate)

### OCR
- ✅ Click "Show Image Upload"
- ✅ Drag and drop an image with text
- ✅ Text is extracted and task created

### Views
- ✅ List View - All active tasks
- ✅ Day View - Today's tasks
- ✅ Week View - 7-day calendar
- ✅ Month View - Full month calendar
- ✅ Completed - View and restore
- ✅ Deleted - View and restore

### Subtasks
- ✅ Open any task detail popup
- ✅ Click "Add Subtask"
- ✅ Subtasks inherit parent attributes

### Calendar Integration
- ✅ Click hamburger menu to open calendar
- ✅ Connect Google Calendar (if configured)
- ✅ Drag tasks onto calendar dates

### Multi-Select
- ✅ Click three-dot icon (bottom-left)
- ✅ Select multiple tasks
- ✅ Bulk set date, tags, duration, or delete

### Real-Time Sync
- ✅ Open app in two browser tabs
- ✅ Make changes in one tab
- ✅ See updates in the other tab instantly

## Troubleshooting

### Voice Input Not Working
- Ensure you're using HTTPS (or localhost)
- Chrome and Edge work best
- Check browser microphone permissions

### Tasks Not Syncing
- Check Supabase connection in browser console
- Verify environment variables are set correctly
- Check real-time subscriptions in Supabase dashboard

### Google Calendar Not Connecting
- Verify API is enabled in Google Cloud Console
- Check client ID and API key are correct
- Ensure authorized origins are configured

### Build Errors
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version (need 18+)

## Production Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Important:** Don't forget to set environment variables in your hosting platform!

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Review environment variables
4. Check the README.md for detailed feature documentation

---

Enjoy your new task management system! 🎉

