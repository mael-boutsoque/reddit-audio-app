export interface GoogleTTSOptions {
  voice?: string;
  rate?: number;
  language?: string;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

interface GoogleVoice {
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  languageCodes: string[];
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// Google Cloud TTS voices - WaveNet and Neural2 (better quality)
export const GOOGLE_VOICES = [
  { id: 'fr-FR-Neural2-A', name: 'Neural2-A (FR Femme)', language: 'fr-FR', gender: 'FEMALE' },
  { id: 'fr-FR-Neural2-B', name: 'Neural2-B (FR Homme)', language: 'fr-FR', gender: 'MALE' },
  { id: 'fr-FR-Neural2-C', name: 'Neural2-C (FR Femme)', language: 'fr-FR', gender: 'FEMALE' },
  { id: 'fr-FR-Neural2-D', name: 'Neural2-D (FR Homme)', language: 'fr-FR', gender: 'MALE' },
  { id: 'fr-FR-Standard-A', name: 'Standard-A (FR Femme)', language: 'fr-FR', gender: 'FEMALE' },
  { id: 'fr-FR-Standard-B', name: 'Standard-B (FR Homme)', language: 'fr-FR', gender: 'MALE' },
  { id: 'en-US-Neural2-A', name: 'Neural2-A (EN Femme)', language: 'en-US', gender: 'FEMALE' },
  { id: 'en-US-Neural2-C', name: 'Neural2-C (EN Homme)', language: 'en-US', gender: 'MALE' },
  { id: 'en-US-Neural2-D', name: 'Neural2-D (EN Homme)', language: 'en-US', gender: 'MALE' },
  { id: 'en-US-Neural2-E', name: 'Neural2-E (EN Femme)', language: 'en-US', gender: 'FEMALE' },
  { id: 'en-US-Neural2-F', name: 'Neural2-F (EN Femme)', language: 'en-US', gender: 'FEMALE' },
  { id: 'en-US-Neural2-G', name: 'Neural2-G (Femme)', language: 'en-US', gender: 'FEMALE' },
  { id: 'en-US-Neural2-H', name: 'Neural2-H (Femme)', language: 'en-US', gender: 'FEMALE' },
  { id: 'en-US-Neural2-I', name: 'Neural2-I (Homme)', language: 'en-US', gender: 'MALE' },
  { id: 'en-US-Neural2-J', name: 'Neural2-J (Homme)', language: 'en-US', gender: 'MALE' },
];

export class GoogleTTSService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isSpeaking: boolean = false;

  async getAvailableVoices(): Promise<GoogleVoice[]> {
    if (!GOOGLE_API_KEY) {
      console.warn('Google API key not configured');
      return [];
    }

    try {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${GOOGLE_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching Google voices:', error);
      return [];
    }
  }

  async speak(text: string, options: GoogleTTSOptions = {}): Promise<void> {
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API key not configured. Please add VITE_GOOGLE_API_KEY to your environment.');
    }

    if (this.isSpeaking) {
      await this.stop();
    }

    const { voice = 'fr-FR-Neural2-A', rate = 1.0, onDone, onError } = options;

    this.isSpeaking = true;

    try {
      // Truncate text to avoid API limits (Google has 5000 byte limit)
      const truncatedText = this.truncateText(text, 4000);
      
      const response = await fetch(`${GOOGLE_TTS_URL}?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: truncatedText },
          voice: {
            languageCode: voice.substring(0, 5),
            name: voice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: rate,
            pitch: 0,
            volumeGainDb: 0,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Google TTS API error: ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Decode base64 audio
      const audioData = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      // Play audio
      await this.playAudio(arrayBuffer, 1.0, onDone, onError);
    } catch (error) {
      this.isSpeaking = false;
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  }

  private async playAudio(
    arrayBuffer: ArrayBuffer,
    playbackRate: number,
    onDone?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // Initialize audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.playbackRate.value = playbackRate;
      
      // Connect to destination
      this.currentSource.connect(this.audioContext.destination);
      
      // Handle completion
      this.currentSource.onended = () => {
        this.isSpeaking = false;
        this.currentSource = null;
        onDone?.();
      };
      
      // Start playback
      this.currentSource.start(0);
    } catch (error) {
      this.isSpeaking = false;
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Already stopped
      }
      this.currentSource = null;
    }
    this.isSpeaking = false;
  }

  async pause(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
  }

  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Try to end at a sentence boundary
    const truncated = text.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > maxLength * 0.8) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }
    
    return truncated + '...';
  }

  convertSpeedToRate(vitessePercent: number): number {
    // vitesse is in percentage (-30 to +30), convert to rate (0.75 to 1.5)
    // Google TTS supports 0.25 to 4.0
    return Math.max(0.75, Math.min(1.5, 1.0 + (vitessePercent / 100)));
  }
}

export const googleTTSService = new GoogleTTSService();
