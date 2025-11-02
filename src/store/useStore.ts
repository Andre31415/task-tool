import { create } from 'zustand';
import { Task, User, ViewMode, GoogleCalendar, GoogleCalendarEvent } from '../types';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Tasks
  tasks: Task[];
  selectedTasks: Set<string>;
  isMultiSelectMode: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  toggleTaskSelection: (taskId: string) => void;
  clearSelectedTasks: () => void;
  setMultiSelectMode: (enabled: boolean) => void;

  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  calendarSidebarOpen: boolean;
  setCalendarSidebarOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Google Calendar
  googleCalendars: GoogleCalendar[];
  googleEvents: GoogleCalendarEvent[];
  setGoogleCalendars: (calendars: GoogleCalendar[]) => void;
  setGoogleEvents: (events: GoogleCalendarEvent[]) => void;
  toggleCalendarVisibility: (calendarId: string) => void;

  // Task creation
  taskHistory: Map<string, Task>;
  addToTaskHistory: (task: Task) => void;
  getTaskSuggestion: (partialTitle: string) => Task | null;

  // Voice recording
  isVoiceRecording: boolean;
  setIsVoiceRecording: (recording: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Actions
  loadTasks: (userId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // User
  user: authService.getCurrentUser(),
  setUser: (user) => set({ user }),

  // Tasks
  tasks: [],
  selectedTasks: new Set(),
  isMultiSelectMode: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => {
    const currentTasks = get().tasks;
    set({ tasks: [...currentTasks, task] });
    get().addToTaskHistory(task);
  },
  updateTask: (taskId, updates) => {
    const currentTasks = get().tasks;
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    set({ tasks: updatedTasks });
  },
  removeTask: (taskId) => {
    const currentTasks = get().tasks;
    set({ tasks: currentTasks.filter((task) => task.id !== taskId) });
  },
  toggleTaskSelection: (taskId) => {
    const selected = new Set(get().selectedTasks);
    if (selected.has(taskId)) {
      selected.delete(taskId);
    } else {
      selected.add(taskId);
    }
    set({ selectedTasks: selected });
  },
  clearSelectedTasks: () => set({ selectedTasks: new Set() }),
  setMultiSelectMode: (enabled) => {
    set({ isMultiSelectMode: enabled });
    if (!enabled) {
      set({ selectedTasks: new Set() });
    }
  },

  // View
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  calendarSidebarOpen: false,
  setCalendarSidebarOpen: (open) => set({ calendarSidebarOpen: open }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Google Calendar
  googleCalendars: [],
  googleEvents: [],
  setGoogleCalendars: (calendars) => set({ googleCalendars: calendars }),
  setGoogleEvents: (events) => set({ googleEvents: events }),
  toggleCalendarVisibility: (calendarId) => {
    const calendars = get().googleCalendars.map((cal) =>
      cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal
    );
    set({ googleCalendars: calendars });
  },

  // Task history for auto-complete
  taskHistory: new Map(),
  addToTaskHistory: (task) => {
    const history = new Map(get().taskHistory);
    history.set(task.title.toLowerCase(), task);
    set({ taskHistory: history });
  },
  getTaskSuggestion: (partialTitle) => {
    const history = get().taskHistory;
    const lowerPartial = partialTitle.toLowerCase();
    
    // Find exact match first
    if (history.has(lowerPartial)) {
      return history.get(lowerPartial) || null;
    }

    // Find partial match
    for (const [key, task] of history.entries()) {
      if (key.startsWith(lowerPartial)) {
        return task;
      }
    }

    return null;
  },

  // Voice recording
  isVoiceRecording: false,
  setIsVoiceRecording: (recording) => set({ isVoiceRecording: recording }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Actions
  loadTasks: async (userId: string) => {
    set({ isLoading: true });
    try {
      const tasks = await taskService.getTasks(userId, false, false);
      set({ tasks });

      // Build task history for auto-complete
      const history = new Map();
      tasks.forEach((task) => {
        history.set(task.title.toLowerCase(), task);
      });
      set({ taskHistory: history });
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshTasks: async () => {
    const user = get().user;
    if (user) {
      await get().loadTasks(user.id);
    }
  },
}));

