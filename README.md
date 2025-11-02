# Task Manager - Comprehensive Task Management Application

A feature-rich task management web application with voice input, calendar integration, timer functionality, and multi-device sync via username-based accounts.

## 🚀 Features

### Core Features
- **Username-Only Authentication** - No password required, simple login with username
- **Cross-Device Sync** - Access your tasks from any device using the same username
- **Real-Time Synchronization** - Tasks update instantly across all logged-in devices

### Task Management
- **Quick Task Entry** - Rapid task creation with title → description flow
- **Auto-Complete** - Suggests previous tasks based on title
- **Voice-to-Task** - Create tasks using voice dictation
- **Image-to-Task (OCR)** - Upload images/screenshots and extract text automatically
- **Rich Task Details** - Add descriptions, notes, tags, dates, and durations
- **Subtasks** - Nested tasks with independent durations and timers
- **File Attachments** - Attach documents, images, and files to tasks

### Task Attributes
- **Duration Tracking** - Estimate time for each task
- **Date Assignment** - Schedule tasks for specific dates
- **Tags** - Categorize tasks with multiple tags
- **Auto-Calculated Timestamps** - Sequential start/end times based on task order

### Timer Functionality
- **Visual Timer** - Click duration to start/pause timer
- **RED Indicator** - Active timers show in red with pulsing animation
- **Persistent Timers** - Continue running across page refreshes
- **Multiple Concurrent Timers** - Run timers on multiple tasks simultaneously

### Task Organization
- **Drag-and-Drop Reordering** - Rearrange tasks with smooth animations
- **Multi-Select Mode** - Select multiple tasks for bulk operations
- **Bulk Actions** - Set date, tags, duration, or delete for multiple tasks
- **Search** - Real-time filtering by title, description, or tags

### Views
- **List View** - Traditional task list with all features
- **Day View** - Tasks scheduled for today
- **Week View** - Week-long task planning
- **Month View** - Monthly task overview
- **Completed Tasks** - View and restore completed tasks
- **Deleted Tasks** - Recover accidentally deleted tasks

### Calendar Integration
- **Sidebar Calendar** - Toggle calendar view alongside task list
- **Drag-to-Schedule** - Drag tasks onto calendar dates
- **Google Calendar Integration** - OAuth 2.0 connection
- **Two-Way Sync** - Import Google Calendar events, export tasks
- **Multi-Calendar Support** - Toggle visibility of different calendars
- **Color-Coded Events** - Visual distinction between calendars

### Voice Features
- **Main Dashboard Mic** - Quick voice task creation
- **In-Task Voice Notes** - Dictate notes directly into tasks
- **Headphone Button Integration** - Hold middle button for 1 second to trigger voice input

### Rich Text Editor
- **Formatting Options** - Bold, italic, underline, headers
- **Lists** - Bullet points and numbered lists
- **Tables** - Insert and edit tables within notes
- **Voice Notes** - Dictate directly into the editor

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management

### Libraries
- **@hello-pangea/dnd** - Drag-and-drop functionality
- **TipTap** - Rich text editor
- **Tesseract.js** - OCR text extraction
- **date-fns** - Date manipulation
- **React DatePicker** - Date selection

### Backend & Services
- **Supabase** - Database, authentication, storage, real-time sync
- **Web Speech API** - Voice recognition
- **Google Calendar API** - Calendar integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd "/Users/andrefarinazojr/Task Tool"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_GOOGLE_API_KEY=your-google-api-key
   ```

4. **Set up Supabase**
   
   Run the SQL schema provided in `src/lib/supabase.ts` to create the necessary tables:
   - users
   - tasks
   - attachments
   - user_preferences
   - task_history

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage

### Getting Started
1. Enter a username on the login screen (no password needed)
2. Start adding tasks using the quick add button or voice input
3. Click on tasks to view details and add rich notes
4. Drag and drop to reorder tasks

### Keyboard Shortcuts
- **Enter** - Confirm task title/description
- **Escape** - Cancel or go back
- **Tab** - Accept auto-complete suggestion
- **Ctrl+H** - Simulate headphone button (for testing)

### Voice Input
- Click the floating microphone button in the bottom-right
- Or hold the middle button on Apple headphones for 1 second
- Speak your task and it will be created automatically

### OCR Text Extraction
- Click "Show Image Upload (OCR)" button
- Drag and drop an image or click to browse
- Text will be extracted and converted to a task

### Multi-Select Mode
- Click the three-dot menu icon at the bottom-left
- Check boxes appear on all tasks
- Select multiple tasks and perform bulk operations

### Calendar
- Click the hamburger menu (☰) in the top-right to toggle calendar
- Drag tasks from the list onto calendar dates
- Connect Google Calendar for event import/export

### Timer
- Click on the duration (e.g., "1h 30m") to start the timer
- Timer turns RED when active
- Click again to pause/resume
- Timers persist across page refreshes

## 📱 Features by View

### List View
- All active tasks
- Quick add, voice input, OCR upload
- Full task management capabilities

### Day View
- Tasks scheduled for today
- Completed and deleted tasks with recovery options
- Green checkbox to restore completed tasks
- Red minus button to restore deleted tasks

### Week View
- 7-day overview
- Assign tasks to different days
- Visual time blocks

### Month View
- Full month calendar
- Task distribution overview
- Drag-to-schedule

### Completed/Deleted Views
- Historical task tracking
- One-click recovery
- Separate pages for each category

## 🔐 Security & Privacy

- No passwords stored - username-only authentication
- All data stored securely in Supabase
- Row Level Security (RLS) policies enabled
- File uploads stored in Supabase Storage
- Real-time sync uses secure WebSocket connections

## 🎨 Design Philosophy

- **Clean & Minimalist** - Focus on tasks, not distractions
- **Intuitive UX** - Natural interactions and flows
- **Responsive** - Works on desktop and mobile
- **Accessible** - Keyboard navigation and screen reader support
- **Fast** - Optimized performance and instant feedback

## 📝 Data Structure

### Task Object
```typescript
{
  id: string
  user_id: string
  title: string
  description: string
  notes: JSON (rich text)
  duration: number (minutes)
  date: string | null
  tags: string[]
  order: number
  parent_id: string | null (for subtasks)
  completed: boolean
  deleted: boolean
  timer_state: TimerState | null
  start_time: string | null (auto-calculated)
  end_time: string | null (auto-calculated)
  created_at: timestamp
  updated_at: timestamp
}
```

## 🔄 Real-Time Sync

The application uses Supabase real-time subscriptions to keep tasks synchronized across all devices:

- Changes made on one device appear instantly on others
- Timer state is synchronized
- Task reordering updates everywhere
- New tasks appear immediately

## 🚨 Troubleshooting

### Voice input not working
- Ensure browser supports Web Speech API (Chrome, Edge work best)
- Check microphone permissions
- Try using HTTPS (required for speech API)

### Google Calendar not connecting
- Verify Google API credentials in `.env`
- Enable Google Calendar API in Google Cloud Console
- Add authorized redirect URIs

### Tasks not syncing
- Check Supabase connection
- Verify real-time subscriptions are active
- Check browser console for errors

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use and modify as needed.

## 🎉 Credits

Built with modern web technologies and best practices to create a seamless task management experience.

---

**Enjoy managing your tasks!** 🚀
