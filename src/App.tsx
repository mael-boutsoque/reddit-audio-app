import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { PlayerScreen } from './screens/PlayerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useSettings } from './hooks/useSettings';
import { useStories } from './hooks/useStories';
import type { Story, Settings } from './types';

function AppContent() {
  const navigate = useNavigate();
  const { settings, saveSettings, loading: settingsLoading } = useSettings();
  const { stories, loading: storiesLoading, error, loadStories, loadMore, clearStories } = useStories();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Load stories when settings are ready
  useEffect(() => {
    if (settings && stories.length === 0 && !storiesLoading) {
      loadStories(settings.subreddit, settings.storiesPerLoad, 'hot', 'all', false);
    }
  }, [settings, stories.length, storiesLoading, loadStories]);

  const handleLoadStories = useCallback(() => {
    if (settings) {
      clearStories();
      loadStories(settings.subreddit, settings.storiesPerLoad, 'hot', 'all', false);
    }
  }, [settings, clearStories, loadStories]);

  const handleLoadMore = useCallback(() => {
    if (settings) {
      loadMore(settings.subreddit, settings.storiesPerLoad, 'hot', 'all');
    }
  }, [settings, loadMore]);

  const handleSelectStory = useCallback((story: Story) => {
    setSelectedStory(story);
    navigate('/player');
  }, [navigate]);

  const handleNextStory = useCallback(() => {
    const currentIndex = stories.findIndex(s => s.permalink === selectedStory?.permalink);
    if (currentIndex >= 0 && currentIndex < stories.length - 1) {
      setSelectedStory(stories[currentIndex + 1]);
    }
  }, [stories, selectedStory]);

  const handleSaveSettings = useCallback((newSettings: Settings) => {
    saveSettings(newSettings);
    clearStories();
  }, [saveSettings, clearStories]);

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (settingsLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#121212'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #3E3E3E',
          borderTop: '4px solid #1DB954',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeScreen
            stories={stories}
            loading={storiesLoading}
            error={error}
            subreddit={settings?.subreddit || 'AmItheAsshole'}
            onLoadStories={handleLoadStories}
            onLoadMore={handleLoadMore}
            onSelectStory={handleSelectStory}
            onNavigateToSettings={handleNavigateToSettings}
          />
        }
      />
      <Route
        path="/player"
        element={
          <PlayerScreen
            story={selectedStory}
            settings={settings}
            onNextStory={handleNextStory}
            onBack={handleBack}
          />
        }
      />
      <Route
        path="/settings"
        element={
          <SettingsScreen
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onBack={handleBack}
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
