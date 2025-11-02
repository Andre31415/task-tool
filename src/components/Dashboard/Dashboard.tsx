import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { TaskList } from '../Tasks/TaskList';
import { QuickAddTask } from '../Tasks/QuickAddTask';
import { VoiceTaskButton } from '../Tasks/VoiceTaskButton';
import { OCRUpload } from '../Tasks/OCRUpload';
import { SearchBar } from '../UI/SearchBar';
import { TaskDetailPopup } from '../Tasks/TaskDetailPopup';
import { AttributeEditor } from '../Tasks/AttributeEditor';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import { CalendarSidebar } from '../Calendar/CalendarSidebar';
import { headphoneButtonListener } from '../../services/voiceService';
import { WeekView } from '../Views/WeekView';
import { MonthView } from '../Views/MonthView';
import { CompletedTasksView } from '../Views/CompletedTasksView';
import { DeletedTasksView } from '../Views/DeletedTasksView';

export function Dashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [attributeEditTask, setAttributeEditTask] = useState<Task | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const {
    user,
    tasks,
    searchQuery,
    setUser,
    loadTasks,
    viewMode,
    setViewMode,
    calendarSidebarOpen,
    setCalendarSidebarOpen,
    isMultiSelectMode,
    setMultiSelectMode,
    selectedTasks,
    clearSelectedTasks,
  } = useStore();

  useEffect(() => {
    if (user) {
      loadTasks(user.id);

      // Set up real-time sync
      const subscription = taskService.subscribeToTasks(user.id, (payload) => {
        console.log('Real-time update:', payload);
        loadTasks(user.id);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, loadTasks]);

  useEffect(() => {
    // Set up headphone button listener
    headphoneButtonListener.onTrigger(() => {
      // This will trigger voice input when headphone button is held
      document.querySelector<HTMLButtonElement>('[title="Add task by voice"]')?.click();
    });

    return () => {
      headphoneButtonListener.destroy();
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleBulkDate = async () => {
    const dateStr = prompt('Enter date (YYYY-MM-DD):');
    if (dateStr && user) {
      await taskService.bulkUpdateTasks(Array.from(selectedTasks), { date: dateStr });
      loadTasks(user.id);
      clearSelectedTasks();
      setMultiSelectMode(false);
    }
  };

  const handleBulkTags = async () => {
    const tagsStr = prompt('Enter tags (comma-separated):');
    if (tagsStr && user) {
      const tags = tagsStr.split(',').map((t) => t.trim());
      await taskService.bulkUpdateTasks(Array.from(selectedTasks), { tags });
      loadTasks(user.id);
      clearSelectedTasks();
      setMultiSelectMode(false);
    }
  };

  const handleBulkDuration = async () => {
    const durationStr = prompt('Enter duration (e.g., 1h 30m or 90m):');
    if (durationStr && user) {
      const hourMatch = durationStr.match(/(\d+)h/);
      const minMatch = durationStr.match(/(\d+)m/);
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minMatch ? parseInt(minMatch[1]) : 0;
      const totalMinutes = hours * 60 + minutes;
      
      await taskService.bulkUpdateTasks(Array.from(selectedTasks), { duration: totalMinutes });
      loadTasks(user.id);
      clearSelectedTasks();
      setMultiSelectMode(false);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedTasks.size} tasks?`) && user) {
      await taskService.bulkDeleteTasks(Array.from(selectedTasks));
      loadTasks(user.id);
      clearSelectedTasks();
      setMultiSelectMode(false);
    }
  };

  // Filter tasks based on view mode and search
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    // Filter by view mode
    if (viewMode === 'completed') {
      // Load all tasks including completed for this view
      filtered = tasks.filter((t) => t.completed);
    } else if (viewMode === 'deleted') {
      // Load all tasks including deleted for this view
      filtered = tasks.filter((t) => t.deleted);
    } else if (viewMode === 'day') {
      const today = new Date().toISOString().split('T')[0];
      filtered = tasks.filter((t) => t.date === today && !t.completed && !t.deleted);
    } else if (viewMode === 'list') {
      filtered = tasks.filter((t) => !t.completed && !t.deleted);
    } else if (viewMode === 'week' || viewMode === 'month') {
      // Week and month views handle their own filtering
      return [];
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((task) => {
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Load all tasks (including completed/deleted) when on those views
  useEffect(() => {
    if (user && (viewMode === 'completed' || viewMode === 'deleted')) {
      taskService.getTasks(user.id, true, true).then((allTasks) => {
        useStore.getState().setTasks(allTasks);
      });
    }
  }, [viewMode, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="w-64">
                <SearchBar />
              </div>

              <button
                onClick={() => setCalendarSidebarOpen(!calendarSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle calendar"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* View Mode Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {(['list', 'day', 'week', 'month', 'completed', 'deleted'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-3 font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className={`flex-1 transition-all ${calendarSidebarOpen ? 'mr-0' : ''}`}>
            {/* Week View */}
            {viewMode === 'week' && <WeekView />}

            {/* Month View */}
            {viewMode === 'month' && <MonthView />}

            {/* Completed Tasks View */}
            {viewMode === 'completed' && <CompletedTasksView />}

            {/* Deleted Tasks View */}
            {viewMode === 'deleted' && <DeletedTasksView />}

            {/* List and Day Views */}
            {(viewMode === 'list' || viewMode === 'day') && (
              <>
                {/* Bulk Actions Bar */}
                {isMultiSelectMode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <div className="text-blue-900 font-medium">
                      {selectedTasks.size} task(s) selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkDate}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded border border-gray-300 text-sm"
                      >
                        Set Date
                      </button>
                      <button
                        onClick={handleBulkTags}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded border border-gray-300 text-sm"
                      >
                        Add Tags
                      </button>
                      <button
                        onClick={handleBulkDuration}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded border border-gray-300 text-sm"
                      >
                        Set Duration
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          clearSelectedTasks();
                          setMultiSelectMode(false);
                        }}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Task Section */}
                {viewMode === 'list' && (
                  <div className="space-y-4 mb-6">
                    <QuickAddTask />
                    
                    <button
                      onClick={() => setShowOCR(!showOCR)}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      {showOCR ? 'Hide' : 'Show'} Image Upload (OCR)
                    </button>

                    {showOCR && (
                      <div className="mb-4">
                        <OCRUpload />
                      </div>
                    )}
                  </div>
                )}

                {/* Task List */}
                <TaskList
                  tasks={filteredTasks}
                  onTaskClick={setSelectedTask}
                  onAttributesClick={setAttributeEditTask}
                />
              </>
            )}
          </div>

          {/* Calendar Sidebar */}
          {calendarSidebarOpen && (
            <div className="w-[40%] animate-slide-in">
              <CalendarSidebar />
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Voice) */}
      <div className="fixed bottom-8 right-8 z-50">
        <VoiceTaskButton />
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailPopup task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {attributeEditTask && (
        <AttributeEditor task={attributeEditTask} onClose={() => setAttributeEditTask(null)} />
      )}

      {/* Multi-select toggle button */}
      {!isMultiSelectMode && viewMode === 'list' && (
        <button
          onClick={() => setMultiSelectMode(true)}
          className="fixed bottom-8 left-8 p-4 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg z-50"
          title="Multi-select mode"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      )}
    </div>
  );
}

