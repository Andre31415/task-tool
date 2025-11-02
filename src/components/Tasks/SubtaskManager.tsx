import { useState, useEffect } from 'react';
import type { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';

interface SubtaskManagerProps {
  parentTask: Task;
  subtasks: Task[];
}

export function SubtaskManager({ parentTask, subtasks }: SubtaskManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDuration, setNewSubtaskDuration] = useState('');
  const { user, addTask, updateTask } = useStore();

  // Auto-aggregate subtask durations to parent task
  useEffect(() => {
    const totalSubtaskDuration = subtasks.reduce((sum, subtask) => sum + (subtask.duration || 0), 0);
    if (totalSubtaskDuration > 0 && totalSubtaskDuration !== parentTask.duration) {
      // Update parent task duration
      taskService.updateTask(parentTask.id, { duration: totalSubtaskDuration }).then((updatedTask) => {
        if (updatedTask) {
          updateTask(parentTask.id, { duration: totalSubtaskDuration });
        }
      });
    }
  }, [subtasks, parentTask.id, parentTask.duration, updateTask]);

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !user) return;

    // Parse duration
    const hourMatch = newSubtaskDuration.match(/(\d+)h/);
    const minMatch = newSubtaskDuration.match(/(\d+)m/);
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    const totalMinutes = hours * 60 + minutes;

    const newSubtask = await taskService.createTask(user.id, {
      title: newSubtaskTitle.trim(),
      parent_id: parentTask.id,
      duration: totalMinutes || 30, // Default 30 minutes
      date: parentTask.date, // Inherit date from parent
      tags: parentTask.tags, // Inherit tags from parent
    });

    if (newSubtask) {
      addTask(newSubtask);
      setNewSubtaskTitle('');
      setNewSubtaskDuration('');
      setIsAdding(false);
    }
  };

  const handleToggleSubtaskComplete = async (subtask: Task) => {
    if (subtask.completed) {
      await taskService.restoreTask(subtask.id);
    } else {
      await taskService.completeTask(subtask.id);
    }
    
    if (user) {
      const updatedTasks = await taskService.getTasks(user.id);
      useStore.getState().setTasks(updatedTasks);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Subtasks</h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {isAdding ? 'Cancel' : '+ Add Subtask'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Subtask title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoFocus
          />
          <input
            type="text"
            value={newSubtaskDuration}
            onChange={(e) => setNewSubtaskDuration(e.target.value)}
            placeholder="Duration (e.g., 30m or 1h 15m)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleAddSubtask}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Add Subtask
          </button>
        </div>
      )}

      {subtasks.length > 0 ? (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${
                subtask.completed ? 'opacity-60' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtaskComplete(subtask)}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {subtask.title}
                </div>
                {subtask.duration > 0 && (
                  <div className="text-sm text-gray-600">
                    {Math.floor(subtask.duration / 60)}h {subtask.duration % 60}m
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No subtasks yet</p>
      )}
    </div>
  );
}

