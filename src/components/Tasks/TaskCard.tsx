import { useState, useEffect } from 'react';
import type { Task, TimerState } from '../../types';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onAttributesClick: (task: Task) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onTaskClick, onAttributesClick, isDragging }: TaskCardProps) {
  const [timerDisplay, setTimerDisplay] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { updateTask, isMultiSelectMode, selectedTasks, toggleTaskSelection } = useStore();

  useEffect(() => {
    if (task.timer_state) {
      const timerState = task.timer_state as TimerState;
      setIsTimerRunning(timerState.is_running);

      if (timerState.is_running && timerState.started_at) {
        const interval = setInterval(() => {
          const elapsed = Date.now() - new Date(timerState.started_at!).getTime();
          const elapsedMinutes = Math.floor(elapsed / 60000);
          const remaining = Math.max(0, timerState.remaining_minutes - elapsedMinutes);
          
          const hours = Math.floor(remaining / 60);
          const minutes = remaining % 60;
          
          if (hours > 0) {
            setTimerDisplay(`${hours}h ${minutes}m`);
          } else {
            setTimerDisplay(`${minutes}m`);
          }

          // Auto-complete when timer reaches 0
          if (remaining === 0) {
            taskService.completeTask(task.id);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        const duration = timerState.remaining_minutes || task.duration;
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        
        if (hours > 0) {
          setTimerDisplay(`${hours}h ${minutes}m`);
        } else {
          setTimerDisplay(`${minutes}m`);
        }
      }
    } else {
      const hours = Math.floor(task.duration / 60);
      const minutes = task.duration % 60;
      
      if (hours > 0) {
        setTimerDisplay(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimerDisplay(`${minutes}m`);
      } else {
        setTimerDisplay('');
      }
    }
  }, [task.timer_state, task.duration, task.id]);

  const handleTimerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isTimerRunning) {
      await taskService.pauseTimer(task.id);
      const updatedTask = await taskService.getTaskById(task.id);
      if (updatedTask) {
        updateTask(task.id, { timer_state: updatedTask.timer_state });
      }
    } else {
      if (task.timer_state) {
        await taskService.resumeTimer(task.id);
      } else {
        await taskService.startTimer(task.id);
      }
      const updatedTask = await taskService.getTaskById(task.id);
      if (updatedTask) {
        updateTask(task.id, { timer_state: updatedTask.timer_state });
      }
    }
  };

  const handleAttributesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAttributesClick(task);
  };

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleTaskSelection(task.id);
  };

  const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      } ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => !isMultiSelectMode && onTaskClick(task)}
    >
      <div className="flex items-start gap-3">
        {/* Multi-select checkbox */}
        {isMultiSelectMode && (
          <input
            type="checkbox"
            checked={selectedTasks.has(task.id)}
            onChange={handleCheckboxClick}
            className="mt-1 w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Task title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>

          {/* Attributes box */}
          <div
            onClick={handleAttributesClick}
            className="inline-flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm cursor-pointer hover:bg-gray-100 transition-all"
          >
            {/* Duration/Timer */}
            {timerDisplay && (
              <div
                onClick={handleTimerClick}
                className={`flex items-center gap-1 font-medium cursor-pointer ${
                  isTimerRunning
                    ? 'text-red-600 timer-active'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className={isTimerRunning ? 'font-bold' : ''}>{timerDisplay}</span>
              </div>
            )}

            {/* Date */}
            {task.date && (
              <div className="flex items-center gap-1 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{format(new Date(task.date), 'MMM d')}</span>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <div className="flex gap-1">
                  {task.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-gray-700">
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-gray-500">+{task.tags.length - 2}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          {task.start_time && task.end_time && (
            <div className="mt-2 text-sm text-gray-600 font-medium">
              {formatTime(task.start_time)} - {formatTime(task.end_time)}
            </div>
          )}

          {/* Description preview */}
          {task.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Three-dot menu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Will implement menu later
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

