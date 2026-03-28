export interface ElevenLabsOptions {
  voice?: string;
  rate?: number;
  language?: string;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
  labels: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
    language?: string;
  };
}

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Free tier voices optimized for French
export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (EN)', language: 'en', preview: 'American female voice' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (FR)', language: 'fr', preview: 'French female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (EN)', language: 'en', preview: 'British female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (FR)', language: 'fr', preview: 'French male voice' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (EN)', language: 'en', preview: 'American female voice' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (EN)', language: 'en', preview: 'American male voice' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (EN)', language: 'en', preview: 'American male voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (EN)', language: 'en', preview: 'American male voice' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam (EN)', language: 'en', preview: 'American male voice' },
  { id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'Claude (FR)', language: 'fr', preview: 'French male voice' },
];

export class ElevenLabsTTSService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isSpeaking: boolean = false;

  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured');
      return [];
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return [];
    }
  }

  async speak(text: string, options: ElevenLabsOptions = {}): Promise<void> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your environment.');
    }

    if (this.isSpeaking) {
      await this.stop();
    }

    const { voice = 'AZnzlk1XvdvUeBnXmlld', rate = 1.0, onDone, onError } = options;

    this.isSpeaking = true;

    try {
      // Truncate text to avoid API limits (free tier has limits)
      const truncatedText = this.truncateText(text, 2500);
      
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice}?optimize_streaming_latency=3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      // Get audio data
      const audioBlob = await response.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Play audio with speed adjustment
      await this.playAudio(arrayBuffer, rate, onDone, onError);
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
    // vitesse is in percentage (-30 to +30), convert to rate (0.7 to 1.3)
    // ElevenLabs supports 0.5 to 1.5
    return Math.max(0.7, Math.min(1.3, 1.0 + (vitessePercent / 100)));
  }
}

export const elevenLabsTTSService = new ElevenLabsTTSService();
