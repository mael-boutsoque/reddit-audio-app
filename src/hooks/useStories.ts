import { useState, useCallback } from 'react';
import type { Story, Category, TimeFilter } from '../types';
import { redditService } from '../services/redditService';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);

  const loadStories = useCallback(async (
    subreddit: string,
    limit: number = 5,
    category: Category = 'hot',
    timeFilter: TimeFilter = 'all',
    append: boolean = false,
    after?: string | null
  ) => {
    console.log('Loading stories for:', subreddit, 'after:', after);
    setLoading(true);
    setError(null);

    try {
      const result = await redditService.fetchStories(subreddit, limit, category, timeFilter, after || undefined);
      console.log('Loaded stories:', result.stories.length, 'next after:', result.after);
      
      if (append) {
        setStories(prev => [...prev, ...result.stories]);
      } else {
        setStories(result.stories);
      }
      
      setAfterCursor(result.after);
      setHasMore(result.after !== null);
    } catch (err) {
      console.error('Error loading stories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (
    subreddit: string,
    limit: number = 5,
    category: Category = 'hot',
    timeFilter: TimeFilter = 'all'
  ) => {
    if (loading || !hasMore) return;
    
    await loadStories(subreddit, limit, category, timeFilter, true, afterCursor);
  }, [loading, hasMore, afterCursor, loadStories]);

  const clearStories = useCallback(() => {
    setStories([]);
    setAfterCursor(null);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    stories,
    loading,
    error,
    hasMore,
    loadStories,
    loadMore,
    clearStories,
  };
}
