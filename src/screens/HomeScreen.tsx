import type { Story } from '../types';
import { COLORS } from '../constants';
import { useEffect, useRef, useCallback } from 'react';

interface HomeScreenProps {
  stories: Story[];
  loading: boolean;
  error: string | null;
  subreddit: string;
  onLoadStories: () => void;
  onLoadMore: () => void;
  onSelectStory: (story: Story) => void;
  onNavigateToSettings: () => void;
}

export function HomeScreen({
  stories,
  loading,
  error,
  subreddit,
  onLoadStories,
  onLoadMore,
  onSelectStory,
  onNavigateToSettings,
}: HomeScreenProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (onLoadStories) {
      onLoadStories();
    }
  }, [subreddit, onLoadStories]);

  // Auto-load more on scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading && stories.length > 0) {
      onLoadMore();
    }
  }, [loading, stories.length, onLoadMore]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const handleRefresh = () => {
    onLoadStories();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>r/{subreddit}</h1>
        <button style={styles.settingsButton} onClick={onNavigateToSettings}>
          ⚙️
        </button>
      </div>

      <div style={styles.content}>
        {loading && stories.length === 0 && (
          <div style={styles.centerContainer}>
            <div style={styles.spinner} />
            <p style={styles.emptyText}>Chargement des histoires...</p>
          </div>
        )}

        {error && (
          <div style={styles.centerContainer}>
            <p style={styles.errorText}>Erreur: {error}</p>
            <button style={styles.retryButton} onClick={handleRefresh}>
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && stories.length === 0 && (
          <div style={styles.centerContainer}>
            <p style={styles.emptyText}>Aucune histoire disponible</p>
          </div>
        )}

        <div style={styles.list}>
          {stories.map((story, index) => (
            <button
              key={`${story.permalink}-${index}`}
              style={styles.storyItem}
              onClick={() => onSelectStory(story)}
            >
              <h3 style={styles.storyTitle}>{story.title}</h3>
              <p style={styles.storyPreview}>
                {story.body.substring(0, 100)}...
              </p>
            </button>
          ))}
          <div ref={sentinelRef} style={styles.sentinel} />
          
          {!loading && stories.length > 0 && (
            <button style={styles.loadMoreButton} onClick={onLoadMore}>
              Charger plus d'histoires
            </button>
          )}
        </div>

        {loading && stories.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Chargement...</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: COLORS.surface,
    borderBottom: `1px solid ${COLORS.surfaceElevated}`,
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  settingsButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${COLORS.surfaceElevated}`,
    borderTop: `4px solid ${COLORS.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: '16px',
  },
  errorText: {
    color: COLORS.accent,
    fontSize: '16px',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.textPrimary,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  storyItem: {
    backgroundColor: COLORS.surface,
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    color: COLORS.textPrimary,
  },
  storyTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    lineHeight: 1.4,
  },
  storyPreview: {
    margin: 0,
    fontSize: '14px',
    color: COLORS.textSecondary,
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: '14px',
    marginLeft: '12px',
  },
  sentinel: {
    height: '20px',
    margin: '20px 0',
  },
  loadMoreButton: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    border: `2px solid ${COLORS.primary}`,
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
    transition: 'background-color 0.2s, transform 0.1s',
  },
};
