import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAttributesClick: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick, onAttributesClick }: TaskListProps) {
  const { user, setTasks } = useStore();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !user) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UX
    setTasks(items);

    // Update order in database
    const taskIds = items.map((task) => task.id);
    await taskService.reorderTasks(user.id, taskIds);

    // Refresh tasks to get updated timestamps
    const updatedTasks = await taskService.getTasks(user.id);
    setTasks(updatedTasks);
  };

  // Group tasks by parent (top-level tasks and subtasks)
  const renderTask = (task: Task, index: number) => {
    const subtasks = tasks.filter((t) => t.parent_id === task.id);

    return (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <TaskCard
              task={task}
              onTaskClick={onTaskClick}
              onAttributesClick={onAttributesClick}
              isDragging={snapshot.isDragging}
            />

            {/* Render subtasks */}
            {subtasks.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
                {subtasks.map((subtask) => (
                  <TaskCard
                    key={subtask.id}
                    task={subtask}
                    onTaskClick={onTaskClick}
                    onAttributesClick={onAttributesClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  // Only show top-level tasks (no parent_id) for drag-and-drop
  const topLevelTasks = tasks.filter((task) => !task.parent_id);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {topLevelTasks.map((task, index) => renderTask(task, index))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

