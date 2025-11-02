import { useStore } from '../../store/useStore';
import { taskService } from '../../services/taskService';
import { format } from 'date-fns';
import type { Task } from '../../types';
import { supabase } from '../../lib/supabase';

export function DeletedTasksView() {
  const { user, tasks, loadTasks } = useStore();

  const deletedTasks = tasks.filter((task) => task.deleted);

  const handleRestore = async (task: Task) => {
    const success = await taskService.restoreTask(task.id);
    if (success && user) {
      loadTasks(user.id);
    }
  };

  const handlePermanentDelete = async (task: Task) => {
    if (confirm('Permanently delete this task? This cannot be undone.')) {
      // Actually delete from database
      const { error } = await supabase
        .from('tm_tasks')
        .delete()
        .eq('id', task.id);
      
      if (!error && user) {
        loadTasks(user.id);
      }
    }
  };

  if (deletedTasks.length === 0) {
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No deleted tasks</h3>
        <p className="mt-2 text-sm text-gray-500">
          Deleted tasks will appear here and can be restored.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Deleted Tasks</h2>
        <p className="mt-1 text-sm text-gray-500">
          {deletedTasks.length} task(s) in trash
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {deletedTasks.map((task) => (
          <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Red minus button to restore */}
              <button
                onClick={() => handleRestore(task)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                title="Restore task"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-500">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  {task.deleted_at && (
                    <span>
                      🗑 Deleted {format(new Date(task.deleted_at), 'MMM d, yyyy')}
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
                          className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Permanent delete button */}
              <button
                onClick={() => handlePermanentDelete(task)}
                className="flex-shrink-0 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                title="Delete permanently"
              >
                Delete Forever
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

