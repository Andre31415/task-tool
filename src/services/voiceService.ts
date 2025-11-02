export class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      if (onError) {
        onError('Speech recognition not supported in this browser');
      }
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (onError) {
        onError('Failed to start speech recognition');
      }
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const voiceService = new VoiceService();

// Headphone button integration
export class HeadphoneButtonListener {
  private isHolding = false;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private onTriggerCallback: (() => void) | null = null;

  constructor() {
    this.setupMediaSessionHandlers();
    this.setupKeyboardHandlers();
  }

  setupMediaSessionHandlers(): void {
    if ('mediaSession' in navigator) {
      // Listen for media key events
      navigator.mediaSession.setActionHandler('play', () => {
        this.handleButtonPress();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.handleButtonPress();
      });
    }
  }

  setupKeyboardHandlers(): void {
    // Listen for keyboard events (for testing without actual headphones)
    document.addEventListener('keydown', (e) => {
      // Use 'H' key to simulate headphone button
      if (e.key === 'h' && e.ctrlKey && !this.isHolding) {
        this.handleButtonPress();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'h' && e.ctrlKey) {
        this.handleButtonRelease();
      }
    });
  }

  private handleButtonPress(): void {
    if (this.isHolding) return;

    this.isHolding = true;
    
    // Wait for 1 second hold
    this.holdTimer = setTimeout(() => {
      if (this.onTriggerCallback) {
        this.onTriggerCallback();
      }
    }, 1000);
  }

  private handleButtonRelease(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    this.isHolding = false;
  }

  onTrigger(callback: () => void): void {
    this.onTriggerCallback = callback;
  }

  destroy(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    }
  }
}

export const headphoneButtonListener = new HeadphoneButtonListener();

