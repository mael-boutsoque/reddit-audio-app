import { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { VOICES, SUBREDDITS, COLORS, DEFAULT_SETTINGS } from '../constants';

interface SettingsScreenProps {
  settings: Settings | null;
  onSaveSettings: (settings: Settings) => void;
  onBack: () => void;
}

export function SettingsScreen({
  settings,
  onSaveSettings,
  onBack,
}: SettingsScreenProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onBack();
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← Retour
        </button>
        <h1 style={styles.headerTitle}>Paramètres</h1>
        <div style={{ width: 60 }} />
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>SÉLECTION DU SUBREDDIT</h2>
          {SUBREDDITS.map((sub) => (
            <button
              key={sub}
              style={{
                ...styles.optionButton,
                ...(localSettings.subreddit === sub ? styles.optionButtonActive : {}),
              }}
              onClick={() => updateSetting('subreddit', sub)}
            >
              r/{sub}
            </button>
          ))}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>SÉLECTION DE LA VOIX</h2>
          {VOICES.map((voice) => (
            <button
              key={voice.id}
              style={{
                ...styles.optionButton,
                ...(localSettings.voice === voice.id ? styles.optionButtonActive : {}),
              }}
              onClick={() => updateSetting('voice', voice.id)}
            >
              {voice.name}
            </button>
          ))}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>TONE (PITCH)</h2>
          <div style={styles.sliderContainer}>
            <span style={styles.sliderValue}>{localSettings.volume}Hz</span>
            <input
              type="range"
              min={-30}
              max={30}
              value={localSettings.volume}
              onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>VITESSE</h2>
          <div style={styles.sliderContainer}>
            <span style={styles.sliderValue}>{localSettings.vitesse}%</span>
            <input
              type="range"
              min={-30}
              max={30}
              value={localSettings.vitesse}
              onChange={(e) => updateSetting('vitesse', parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.switchRow}>
            <span style={styles.sectionTitle}>Traduire en français</span>
            <input
              type="checkbox"
              checked={localSettings.translate}
              onChange={(e) => updateSetting('translate', e.target.checked)}
              style={styles.checkbox}
            />
          </div>
          <p style={styles.hint}>
            Traduit automatiquement les histoires anglaises en français
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>NOMBRE D'HISTOIRES À CHARGER</h2>
          <div style={styles.sliderContainer}>
            <span style={styles.sliderValue}>{localSettings.storiesPerLoad} histoires</span>
            <input
              type="range"
              min={1}
              max={20}
              value={localSettings.storiesPerLoad}
              onChange={(e) => updateSetting('storiesPerLoad', parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.saveButton} onClick={handleSave}>
          Enregistrer les modifications
        </button>
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
  backButton: {
    background: 'none',
    border: 'none',
    color: COLORS.textSecondary,
    fontSize: '16px',
    cursor: 'pointer',
    padding: '8px 0',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  optionButton: {
    width: '100%',
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.surfaceElevated}`,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '8px',
    textAlign: 'left',
    color: COLORS.textSecondary,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  sliderContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: '12px',
    padding: '16px',
  },
  sliderValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '12px',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: COLORS.surfaceElevated,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  switchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: '12px',
    padding: '16px',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    accentColor: COLORS.primary,
    cursor: 'pointer',
  },
  hint: {
    fontSize: '12px',
    color: COLORS.textMuted,
    marginTop: '8px',
    marginLeft: '16px',
  },
  footer: {
    padding: '20px',
    backgroundColor: COLORS.surface,
    borderTop: `1px solid ${COLORS.surfaceElevated}`,
  },
  saveButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    color: COLORS.textPrimary,
    border: 'none',
    padding: '16px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
