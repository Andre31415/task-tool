import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Task } from '../../types';
import { taskService } from '../../services/taskService';

export function WeekView() {
  const [currentDate] = useState(new Date());
  const { user, tasks, loadTasks } = useStore();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(
      (task) => task.date === dateStr && !task.completed && !task.deleted
    );
  };

  const handleDrop = async (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && user) {
      const dateStr = format(date, 'yyyy-MM-dd');
      await taskService.updateTask(taskId, { date: dateStr });
      loadTasks(user.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </h2>

      <div className="grid grid-cols-7 gap-4">
        {daysInWeek.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`border rounded-lg p-4 min-h-[400px] ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(day, e)}
            >
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-500">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {task.title}
                    </div>
                    {task.duration > 0 && (
                      <div className="text-xs text-gray-600">
                        {Math.floor(task.duration / 60)}h {task.duration % 60}m
                      </div>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {dayTasks.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-8">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

