import { useState, useCallback } from 'react';
import type { Story, Category, TimeFilter } from '../types';
import { redditService } from '../services/redditService';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadStories = useCallback(async (
    subreddit: string,
    limit: number = 5,
    category: Category = 'hot',
    timeFilter: TimeFilter = 'all',
    append: boolean = false,
    translate: boolean = true
  ) => {
    console.log('Loading stories for:', subreddit);
    setLoading(true);
    setError(null);

    try {
      const newStories = await redditService.fetchStories(subreddit, limit, category, timeFilter, translate);
      console.log('Loaded stories:', newStories.length);
      
      if (append) {
        setStories(prev => [...prev, ...newStories]);
      } else {
        setStories(newStories);
      }
      
      setHasMore(newStories.length >= limit);
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
    timeFilter: TimeFilter = 'all',
    translate: boolean = true
  ) => {
    if (loading || !hasMore) return;
    
    await loadStories(subreddit, limit, category, timeFilter, true, translate);
  }, [loading, hasMore, loadStories]);

  const clearStories = useCallback(() => {
    setStories([]);
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
