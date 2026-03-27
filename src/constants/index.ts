export const VOICES = [
  { id: 'fr-FR-VivienneMultilingualNeural', name: 'Vivienne (FR)', language: 'fr-FR' },
  { id: 'fr-FR-RemyMultilingualNeural', name: 'Remy (FR)', language: 'fr-FR' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (FR)', language: 'fr-FR' },
  { id: 'fr-FR-HenriNeural', name: 'Henri (FR)', language: 'fr-FR' },
  { id: 'en-US-AvaNeural', name: 'Ava (EN)', language: 'en-US' },
  { id: 'en-US-AndrewNeural', name: 'Andrew (EN)', language: 'en-US' },
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
  voice: VOICES[0].id,
  volume: 0,
  vitesse: -10,
  auto_next: true,
  subreddit: SUBREDDITS[0],
  translate: true,
  storiesPerLoad: 5,
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
