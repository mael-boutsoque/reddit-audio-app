export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  language?: string;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export class TTSService {
  private isSpeaking: boolean = false;

  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Voices might not be loaded yet
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (this.isSpeaking) {
      await this.stop();
    }

    const { rate = 1.0, pitch = 1.0, language = 'fr-FR', onDone, onError } = options;

    this.isSpeaking = true;

    const sanitizedText = this.sanitizeText(text);

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => {
        this.isSpeaking = false;
        onDone?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        const error = new Error(`TTS Error: ${event.error}`);
        onError?.(error);
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
      
      // Resolve immediately after starting speech
      resolve();
    });
  }

  async stop(): Promise<void> {
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  async pause(): Promise<void> {
    if (this.isSpeaking && window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }

  async resume(): Promise<void> {
    if (this.isSpeaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .substring(0, 4000); // Limit text length for TTS
  }

  convertSpeedToRate(vitessePercent: number): number {
    // vitesse is in percentage (-30 to +30), convert to rate (0.5 to 2.0)
    return 1.0 + (vitessePercent / 100);
  }

  convertVolumeToPitch(volumeHz: number): number {
    // volume (tone) is in Hz (-30 to +30), convert to pitch (0.5 to 2.0)
    return 1.0 + (volumeHz / 100);
  }
}

export const ttsService = new TTSService();
