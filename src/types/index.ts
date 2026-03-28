export interface Story {
  title: string;
  body: string;
  permalink: string;
}

export interface RedditPost {
  title: string;
  author: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  selftext?: string;
}

export type TTSProvider = 'browser' | 'elevenlabs';

export interface Settings {
  voice: string;
  volume: number;
  vitesse: number;
  auto_next: boolean;
  subreddit: string;
  translate: boolean;
  storiesPerLoad: number;
  ttsProvider: TTSProvider;
}

export type Category = 'hot' | 'top' | 'new' | 'rising';

export type TimeFilter = 'all' | 'day' | 'week' | 'month' | 'year';
