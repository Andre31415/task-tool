export interface User {
  id: string;
  username: string;
  password_hash?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  notes: string; // Rich text JSON
  duration: number; // in minutes
  date: string | null;
  tags: string[];
  order: number;
  parent_id: string | null; // for subtasks
  completed: boolean;
  deleted: boolean;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  timer_state: TimerState | null;
  start_time: string | null; // Auto-calculated
  end_time: string | null; // Auto-calculated
  is_recurring: boolean;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'annually' | null;
  recurrence_end_date: string | null;
  add_to_calendar: boolean;
  google_calendar_event_id: string | null;
}

export interface TimerState {
  is_running: boolean;
  started_at: string | null; // ISO timestamp
  remaining_minutes: number;
  original_duration: number;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  calendar_id: string;
  calendar_name: string;
  color: string;
}

export interface GoogleCalendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  default_view: 'list' | 'calendar' | 'day' | 'week' | 'month';
  calendar_visible: boolean;
  google_calendars: GoogleCalendar[];
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'restored';
  changes: Record<string, any>;
  created_at: string;
}

export type ViewMode = 'list' | 'day' | 'week' | 'month' | 'completed' | 'deleted';

export interface BulkOperation {
  type: 'date' | 'tags' | 'duration' | 'delete';
  value?: any;
}

export interface VoiceCommand {
  text: string;
  timestamp: string;
  source: 'main' | 'task' | 'headphones';
}
