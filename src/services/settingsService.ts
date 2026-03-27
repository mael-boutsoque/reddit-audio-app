import type { Settings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';

export class SettingsService {
  async loadSettings(): Promise<Settings> {
    try {
      const jsonValue = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (jsonValue != null) {
        const parsed = JSON.parse(jsonValue);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<Settings> {
    const currentSettings = await this.loadSettings();
    const newSettings = { ...currentSettings, [key]: value };
    await this.saveSettings(newSettings);
    return newSettings;
  }

  async resetSettings(): Promise<Settings> {
    await this.saveSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
}

export const settingsService = new SettingsService();
