import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { googleCalendarService } from '../../services/googleCalendarService';

export function CalendarSidebar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const { user, tasks, loadTasks, googleCalendars, googleEvents, setGoogleCalendars, setGoogleEvents } = useStore();

  useEffect(() => {
    // Initialize Google Calendar if needed
    googleCalendarService.initialize().catch(console.error);
  }, []);

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    try {
      const success = await googleCalendarService.signIn();
      if (success) {
        const calendars = await googleCalendarService.getCalendars();
        setGoogleCalendars(calendars);

        // Load events for current month
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const visibleCalendarIds = calendars.filter((c) => c.visible).map((c) => c.id);
        const events = await googleCalendarService.getEvents(visibleCalendarIds, start, end);
        setGoogleEvents(events);
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleTaskDrop = async (taskId: string, date: Date) => {
    if (!user) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    await taskService.updateTask(taskId, { date: dateStr });
    loadTasks(user.id);
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.date === dateStr && !task.completed && !task.deleted);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Google Calendar Connection */}
      {!googleCalendarService.getIsSignedIn() ? (
        <button
          onClick={handleGoogleConnect}
          disabled={isConnectingGoogle}
          className="w-full mb-6 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isConnectingGoogle ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connect Google Calendar
            </>
          )}
        </button>
      ) : (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Google Calendars</span>
            <button
              onClick={() => googleCalendarService.signOut()}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Disconnect
            </button>
          </div>
          <div className="space-y-2">
            {googleCalendars.map((cal) => (
              <label key={cal.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cal.visible}
                  onChange={() => {
                    // Toggle calendar visibility
                    const updated = googleCalendars.map((c) =>
                      c.id === cal.id ? { ...c, visible: !c.visible } : c
                    );
                    setGoogleCalendars(updated);
                  }}
                  className="w-4 h-4 rounded"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cal.color }}
                />
                <span className="text-sm text-gray-700">{cal.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('taskId');
                if (taskId) {
                  handleTaskDrop(taskId, day);
                }
              }}
              className={`aspect-square p-1 border rounded-lg cursor-pointer transition-colors ${
                isToday
                  ? 'border-blue-500 bg-blue-50'
                  : isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium text-gray-900 mb-1">
                {format(day, 'd')}
              </div>
              {dayTasks.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 truncate"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] text-gray-500">+{dayTasks.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          <div className="space-y-2">
            {getTasksForDate(selectedDate).map((task) => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{task.title}</div>
                {task.start_time && task.end_time && (
                  <div className="text-sm text-gray-600 mt-1">
                    {task.start_time} - {task.end_time}
                  </div>
                )}
              </div>
            ))}
            {getTasksForDate(selectedDate).length === 0 && (
              <p className="text-sm text-gray-500">No tasks scheduled</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

