export const VOICES = [
  // Browser voices
  { id: 'fr-FR-VivienneMultilingualNeural', name: 'Vivienne (Browser FR)', language: 'fr-FR', provider: 'browser' },
  { id: 'fr-FR-RemyMultilingualNeural', name: 'Remy (Browser FR)', language: 'fr-FR', provider: 'browser' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (Browser FR)', language: 'fr-FR', provider: 'browser' },
  { id: 'fr-FR-HenriNeural', name: 'Henri (Browser FR)', language: 'fr-FR', provider: 'browser' },
  { id: 'en-US-AvaNeural', name: 'Ava (Browser EN)', language: 'en-US', provider: 'browser' },
  { id: 'en-US-AndrewNeural', name: 'Andrew (Browser EN)', language: 'en-US', provider: 'browser' },
  // ElevenLabs voices
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (ElevenLabs FR)', language: 'fr-FR', provider: 'elevenlabs' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (ElevenLabs FR)', language: 'fr-FR', provider: 'elevenlabs' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (ElevenLabs EN)', language: 'en-US', provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (ElevenLabs EN)', language: 'en-US', provider: 'elevenlabs' },
  // Google Cloud voices (medium quality)
  { id: 'fr-FR-Neural2-A', name: 'Neural2-A (Google FR Femme)', language: 'fr-FR', provider: 'google' },
  { id: 'fr-FR-Neural2-B', name: 'Neural2-B (Google FR Homme)', language: 'fr-FR', provider: 'google' },
  { id: 'fr-FR-Neural2-C', name: 'Neural2-C (Google FR Femme)', language: 'fr-FR', provider: 'google' },
  { id: 'fr-FR-Neural2-D', name: 'Neural2-D (Google FR Homme)', language: 'fr-FR', provider: 'google' },
  { id: 'en-US-Neural2-A', name: 'Neural2-A (Google EN Femme)', language: 'en-US', provider: 'google' },
  { id: 'en-US-Neural2-C', name: 'Neural2-C (Google EN Homme)', language: 'en-US', provider: 'google' },
  { id: 'en-US-Neural2-D', name: 'Neural2-D (Google EN Homme)', language: 'en-US', provider: 'google' },
  { id: 'en-US-Neural2-E', name: 'Neural2-E (Google EN Femme)', language: 'en-US', provider: 'google' },
];

export const SUBREDDITS = [
  'AmItheAsshole',
  'relationship_advice',
  'AskReddit',
  'TrueOffMyChest',
  'confession',
  'tifu',
  'offmychest',
  'legaladvice',
];

export const DEFAULT_SETTINGS = {
  voice: 'AZnzlk1XvdvUeBnXmlld', // Default to ElevenLabs French voice
  volume: 0,
  vitesse: -10,
  auto_next: true,
  subreddit: SUBREDDITS[0],
  translate: true,
  storiesPerLoad: 5,
  ttsProvider: 'elevenlabs' as const,
};

export const COLORS = {
  background: '#121212',
  surface: '#282828',
  surfaceElevated: '#3E3E3E',
  primary: '#1DB954',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#6A6A6A',
  accent: '#FF0000',
};

export const STORAGE_KEYS = {
  SETTINGS: 'reddit_audio_settings',
  STORIES: 'reddit_audio_stories',
};
