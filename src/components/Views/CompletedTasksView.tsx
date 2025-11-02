import { useStore } from '../../store/useStore';
import { taskService } from '../../services/taskService';
import { format } from 'date-fns';
import { Task } from '../../types';

export function CompletedTasksView() {
  const { user, tasks, loadTasks } = useStore();

  const completedTasks = tasks.filter((task) => task.completed);

  const handleRestore = async (task: Task) => {
    const success = await taskService.restoreTask(task.id);
    if (success && user) {
      loadTasks(user.id);
    }
  };

  const handlePermanentDelete = async (task: Task) => {
    if (confirm('Permanently delete this task? This cannot be undone.')) {
      // For now, just mark as deleted (you could add a permanent_delete flag later)
      await taskService.deleteTask(task.id);
      if (user) {
        loadTasks(user.id);
      }
    }
  };

  if (completedTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No completed tasks</h3>
        <p className="mt-2 text-sm text-gray-500">
          Tasks you complete will appear here for easy reference.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Completed Tasks</h2>
        <p className="mt-1 text-sm text-gray-500">
          {completedTasks.length} task(s) completed
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {completedTasks.map((task) => (
          <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Green checkbox to restore */}
              <button
                onClick={() => handleRestore(task)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
                title="Restore task"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 line-through">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  {task.completed_at && (
                    <span>
                      ✓ Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}
                    </span>
                  )}
                  {task.duration > 0 && (
                    <span>
                      ⏱ {Math.floor(task.duration / 60)}h {task.duration % 60}m
                    </span>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handlePermanentDelete(task)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                title="Delete permanently"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

