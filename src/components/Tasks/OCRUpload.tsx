import { useState, useRef } from 'react';
import { ocrService } from '../../services/ocrService';
import { taskService } from '../../services/taskService';
import { useStore } from '../../store/useStore';

export function OCRUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, addTask } = useStore();

  const handleFileUpload = async (file: File) => {
    const validation = ocrService.validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsProcessing(true);

    try {
      const extractedText = await ocrService.extractTextFromImage(file);
      
      if (extractedText && user) {
        const newTask = await taskService.createTask(user.id, {
          title: extractedText.split('\n')[0] || 'Untitled from OCR',
          description: extractedText,
        });

        if (newTask) {
          addTask(newTask);
        }
      }
    } catch (error) {
      console.error('OCR error:', error);
      alert('Failed to extract text from image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => ocrService.isImageFile(file));

    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Extracting text from image...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <p className="text-gray-700 font-medium">Upload image or screenshot</p>
            <p className="text-sm text-gray-500 mt-1">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Text will be extracted and converted to a task
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

