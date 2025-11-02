import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import type { Task, Attachment } from '../../types';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';
import { voiceService } from '../../services/voiceService';
import { SubtaskManager } from './SubtaskManager';

interface TaskDetailPopupProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailPopup({ task, onClose }: TaskDetailPopupProps) {
  const [title, setTitle] = useState(task.title);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { updateTask, setIsVoiceRecording, tasks } = useStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get subtasks for this task
  const subtasks = tasks.filter((t) => t.parent_id === task.id);

  // Initialize rich text editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: task.notes ? JSON.parse(task.notes || '{}') : '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    loadAttachments();
  }, [task.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, editor]);

  const loadAttachments = async () => {
    const attachs = await taskService.getAttachments(task.id);
    setAttachments(attachs);
  };

  const handleSave = async () => {
    const notes = editor ? JSON.stringify(editor.getJSON()) : task.notes;
    
    await taskService.updateTask(task.id, {
      title,
      notes,
    });

    updateTask(task.id, {
      title,
      notes,
    });

    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);

    try {
      for (const file of Array.from(files)) {
        const attachment = await taskService.uploadAttachment(task.id, file);
        if (attachment) {
          setAttachments([...attachments, attachment]);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    const success = await taskService.deleteAttachment(attachmentId);
    if (success) {
      setAttachments(attachments.filter((a) => a.id !== attachmentId));
    }
  };

  const handleVoiceNote = () => {
    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
      setIsVoiceRecording(false);
    } else {
      setIsRecording(true);
      setIsVoiceRecording(true);
      voiceService.startListening(
        (text) => {
          if (editor) {
            editor.commands.insertContent(`<p>${text}</p>`);
          }
          setIsRecording(false);
          setIsVoiceRecording(false);
        },
        (error) => {
          console.error('Voice error:', error);
          setIsRecording(false);
          setIsVoiceRecording(false);
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 outline-none border-none focus:ring-0"
            placeholder="Task title"
          />
        </div>

        {/* Editor Toolbar */}
        <div className="border-b border-gray-200 p-4 flex flex-wrap gap-2">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor?.isActive('bold') ? 'bg-gray-200' : ''
            }`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor?.isActive('italic') ? 'bg-gray-200' : ''
            }`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor?.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor?.isActive('orderedList') ? 'bg-gray-200' : ''
            }`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="p-2 rounded hover:bg-gray-100"
            title="Insert Table"
          >
            ⊞
          </button>
          <div className="flex-1" />
          <button
            onClick={handleVoiceNote}
            className={`p-2 rounded hover:bg-gray-100 ${
              isRecording ? 'bg-red-100 text-red-600 animate-pulse' : ''
            }`}
            title="Voice note"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <EditorContent editor={editor} />
        </div>

        {/* Subtasks */}
        <div className="border-t border-gray-200 p-6">
          <SubtaskManager parentTask={task} subtasks={subtasks} />
        </div>

        {/* Attachments */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Attachments</h4>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploadingFile ? 'Uploading...' : '+ Add File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate block"
                      >
                        {attachment.file_name}
                      </a>
                      <p className="text-xs text-gray-500">
                        {(attachment.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    className="text-red-600 hover:text-red-800 p-1"
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
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
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
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}

