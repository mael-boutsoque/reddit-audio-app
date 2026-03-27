import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { settingsService } from '../services/settingsService';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await settingsService.loadSettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = useCallback(async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const newSettings = await settingsService.updateSetting(key, value);
    setSettings(newSettings);
    return newSettings;
  }, []);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    await settingsService.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const resetSettings = useCallback(async () => {
    const defaults = await settingsService.resetSettings();
    setSettings(defaults);
    return defaults;
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    saveSettings,
    resetSettings,
    refresh: loadSettings,
  };
}
