import { useState } from 'react';
import { voiceService } from '../../services/voiceService';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';

export function VoiceTaskButton() {
  const [isRecording, setIsRecording] = useState(false);
  const { user, addTask, setIsVoiceRecording } = useStore();

  const handleVoiceInput = () => {
    if (!voiceService.isSupported()) {
      alert('Voice input is not supported in this browser');
      return;
    }

    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
      setIsVoiceRecording(false);
    } else {
      setIsRecording(true);
      setIsVoiceRecording(true);
      
      voiceService.startListening(
        async (text) => {
          if (user && text.trim()) {
            const newTask = await taskService.createTask(user.id, {
              title: text.trim(),
            });
            
            if (newTask) {
              addTask(newTask);
            }
          }
          setIsRecording(false);
          setIsVoiceRecording(false);
        },
        (error) => {
          console.error('Voice input error:', error);
          alert(`Voice input error: ${error}`);
          setIsRecording(false);
          setIsVoiceRecording(false);
        }
      );
    }
  };

  return (
    <button
      onClick={handleVoiceInput}
      className={`p-3 rounded-full transition-all shadow-lg ${
        isRecording
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
      title="Add task by voice"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

