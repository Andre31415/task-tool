import Tesseract from 'tesseract.js';

export class OCRService {
  async extractTextFromImage(file: File): Promise<string> {
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      return result.data.text.trim();
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromImageUrl(imageUrl: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageUrl, 'eng');
      return result.data.text.trim();
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to extract text from image URL');
    }
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!this.isImageFile(file)) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 10MB' };
    }

    return { valid: true };
  }
}

export const ocrService = new OCRService();

