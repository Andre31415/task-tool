import { useState, useEffect, useRef } from 'react';
import type { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AttributeEditorProps {
  task: Task;
  onClose: () => void;
}

export function AttributeEditor({ task, onClose }: AttributeEditorProps) {
  const [duration, setDuration] = useState({
    hours: Math.floor(task.duration / 60),
    minutes: task.duration % 60,
  });
  const [date, setDate] = useState<Date | null>(task.date ? new Date(task.date) : null);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(task.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'annually'>(
    task.recurrence_pattern || 'daily'
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
    task.recurrence_end_date ? new Date(task.recurrence_end_date) : null
  );
  const [addToCalendar, setAddToCalendar] = useState(task.add_to_calendar || false);
  const { updateTask } = useStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [duration, date, tags]);

  const handleSave = async () => {
    const totalMinutes = duration.hours * 60 + duration.minutes;
    const dateStr = date ? date.toISOString().split('T')[0] : null;
    const endDateStr = recurrenceEndDate ? recurrenceEndDate.toISOString().split('T')[0] : null;

    await taskService.updateTask(task.id, {
      duration: totalMinutes,
      date: dateStr,
      tags,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_end_date: isRecurring ? endDateStr : null,
      add_to_calendar: addToCalendar,
    });

    updateTask(task.id, {
      duration: totalMinutes,
      date: dateStr,
      tags,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_end_date: isRecurring ? endDateStr : null,
      add_to_calendar: addToCalendar,
    });

    onClose();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Attributes</h3>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={duration.hours}
                onChange={(e) => setDuration({ ...duration, hours: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={duration.minutes}
                onChange={(e) => setDuration({ ...duration, minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Or type directly:
            <input
              type="text"
              placeholder="e.g., 1h 30m or 90m"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                const hourMatch = value.match(/(\d+)h/);
                const minMatch = value.match(/(\d+)m/);
                
                if (hourMatch || minMatch) {
                  setDuration({
                    hours: hourMatch ? parseInt(hourMatch[1]) : 0,
                    minutes: minMatch ? parseInt(minMatch[1]) : 0,
                  });
                }
              }}
              className="ml-2 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholderText="Select a date"
            isClearable
          />
        </div>

        {/* Recurring Task */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Recurring Task</span>
          </label>
        </div>

        {isRecurring && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
              <DatePicker
                selected={recurrenceEndDate}
                onChange={(date) => setRecurrenceEndDate(date)}
                dateFormat="MMMM d, yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholderText="Never ends"
                isClearable
                minDate={date || new Date()}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToCalendar}
                  onChange={(e) => setAddToCalendar(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Add to Google Calendar</span>
              </label>
              {addToCalendar && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Task will be synced to your Google Calendar with recurrence
                </p>
              )}
            </div>
          </>
        )}

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag and press Enter"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

