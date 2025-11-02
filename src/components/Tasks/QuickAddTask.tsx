import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { taskService } from '../../services/taskService';

export function QuickAddTask() {
  const [step, setStep] = useState<'title' | 'description' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const { user, addTask, getTaskSuggestion } = useStore();

  useEffect(() => {
    if (step === 'title' && titleInputRef.current) {
      titleInputRef.current.focus();
    } else if (step === 'description' && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [step]);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    // Check for auto-complete suggestion
    if (value.length >= 2) {
      const suggested = getTaskSuggestion(value);
      if (suggested && suggested.title.toLowerCase().startsWith(value.toLowerCase())) {
        setSuggestion(suggested.title);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a suggestion, use it
      if (suggestion) {
        const suggestedTask = getTaskSuggestion(title);
        if (suggestedTask && user) {
          // Create task with all attributes from suggestion
          taskService.createTask(user.id, {
            title: suggestedTask.title,
            description: suggestedTask.description,
            duration: suggestedTask.duration,
            tags: suggestedTask.tags,
            date: suggestedTask.date,
          }).then((newTask) => {
            if (newTask) {
              addTask(newTask);
            }
          });
          setTitle('');
          setSuggestion('');
          setStep(null);
        }
      } else {
        // Move to description step
        setStep('description');
      }
    } else if (e.key === 'Escape') {
      setTitle('');
      setSuggestion('');
      setStep(null);
    } else if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setTitle(suggestion);
      setSuggestion('');
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createTask();
    } else if (e.key === 'Escape') {
      setDescription('');
      setStep('title');
    }
  };

  const createTask = async () => {
    if (!user || !title.trim()) return;

    const newTask = await taskService.createTask(user.id, {
      title: title.trim(),
      description: description.trim(),
    });

    if (newTask) {
      addTask(newTask);
    }

    setTitle('');
    setDescription('');
    setSuggestion('');
    setStep(null);
  };

  if (step === null) {
    return (
      <button
        onClick={() => setStep('title')}
        className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add New Task
      </button>
    );
  }

  return (
    <div className="w-full bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg">
      {step === 'title' && (
        <div className="relative">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Task title (press Enter)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {suggestion && (
            <div className="absolute top-0 left-0 w-full px-3 py-2 pointer-events-none text-gray-400">
              <span className="invisible">{title}</span>
              <span>{suggestion.slice(title.length)}</span>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {suggestion
              ? 'Press Enter to use suggestion, Tab to accept, or keep typing'
              : 'Press Enter to add description, Escape to cancel'}
          </p>
        </div>
      )}

      {step === 'description' && (
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">{title}</div>
          <input
            ref={descInputRef}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Description (press Enter to create)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            Press Enter to create task, Escape to go back
          </p>
        </div>
      )}
    </div>
  );
}

