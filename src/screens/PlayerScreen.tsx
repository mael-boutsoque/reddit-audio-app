import { useEffect, useState, useRef } from 'react';
import type { Story, Settings } from '../types';
import { ttsService } from '../services/ttsService';
import { elevenLabsTTSService } from '../services/elevenLabsTTS';
import { COLORS } from '../constants';

interface PlayerScreenProps {
  story: Story | null;
  settings: Settings | null;
  onNextStory: () => void;
  onBack: () => void;
}

export function PlayerScreen({
  story,
  settings,
  onNextStory,
  onBack,
}: PlayerScreenProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      ttsService.stop();
      elevenLabsTTSService.stop();
    };
  }, []);

  const getTTSService = (provider: string) => {
    return provider === 'elevenlabs' ? elevenLabsTTSService : ttsService;
  };

  const startSpeaking = async () => {
    if (!story || !settings) return;

    setIsGenerating(true);
    setTtsError(null);

    const timeoutId = setTimeout(() => {
      console.warn('TTS timeout - arrêt forcé');
      getTTSService(settings.ttsProvider).stop();
      setIsGenerating(false);
      setIsSpeaking(false);
    }, settings.ttsProvider === 'elevenlabs' ? 30000 : 10000);

    try {
      const text = `${story.title}.\n\n${story.body}`;
      const service = getTTSService(settings.ttsProvider);
      const rate = service.convertSpeedToRate(settings.vitesse);

      if (settings.ttsProvider === 'elevenlabs') {
        await elevenLabsTTSService.speak(text, {
          voice: settings.voice,
          rate,
          onDone: () => {
            clearTimeout(timeoutId);
            if (isMountedRef.current) {
              setIsSpeaking(false);
            }
          },
          onError: (error) => {
            clearTimeout(timeoutId);
            console.error('ElevenLabs TTS Error:', error);
            if (isMountedRef.current) {
              setIsSpeaking(false);
              setIsGenerating(false);
              setTtsError('Erreur ElevenLabs: ' + error.message);
            }
          },
        });
      } else {
        const pitch = ttsService.convertVolumeToPitch(settings.volume);
        await ttsService.speak(text, {
          language: settings.voice.startsWith('fr') ? 'fr-FR' : 'en-US',
          rate,
          pitch,
          onDone: () => {
            clearTimeout(timeoutId);
            if (isMountedRef.current) {
              setIsSpeaking(false);
            }
          },
          onError: (error) => {
            clearTimeout(timeoutId);
            console.error('Browser TTS Error:', error);
            if (isMountedRef.current) {
              setIsSpeaking(false);
              setIsGenerating(false);
            }
          },
        });
      }

      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        setIsSpeaking(true);
        setIsGenerating(false);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error starting TTS:', error);
      if (isMountedRef.current) {
        setIsGenerating(false);
        setTtsError(error instanceof Error ? error.message : 'Erreur TTS');
      }
    }
  };

  const stopSpeaking = async () => {
    await ttsService.stop();
    await elevenLabsTTSService.stop();
    setIsSpeaking(false);
  };

  const cancelSpeaking = async () => {
    await ttsService.stop();
    await elevenLabsTTSService.stop();
    setIsGenerating(false);
    setIsSpeaking(false);
  };

  const toggleSpeaking = async () => {
    const actuallySpeaking = ttsService.isCurrentlySpeaking() || 
                            elevenLabsTTSService.isCurrentlySpeaking() || 
                            isSpeaking;
    
    if (actuallySpeaking) {
      await stopSpeaking();
    } else {
      setIsSpeaking(false);
      setIsGenerating(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await startSpeaking();
    }
  };

  if (!story) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={onBack}>
            ← Retour
          </button>
        </div>
        <div style={styles.centerContainer}>
          <p style={styles.emptyText}>Aucune histoire sélectionnée</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← Retour
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>{story.title}</h1>
        <p style={styles.body}>{story.body}</p>
      </div>

      <div style={styles.controls}>
        {ttsError && (
          <div style={styles.errorContainer}>
            <span style={styles.errorText}>{ttsError}</span>
            <button style={styles.errorDismiss} onClick={() => setTtsError(null)}>✕</button>
          </div>
        )}
        {isGenerating ? (
          <div style={styles.generatingContainer}>
            <div style={styles.spinner} />
            <span style={styles.generatingText}>Génération audio...</span>
            <button style={styles.cancelButton} onClick={cancelSpeaking}>
              ✕ Annuler
            </button>
          </div>
        ) : (
          <button
            style={{
              ...styles.playButton,
              ...(isSpeaking ? styles.playButtonActive : {}),
            }}
            onClick={toggleSpeaking}
          >
            {isSpeaking ? '⏸ Pause' : '▶ Écouter'}
          </button>
        )}

        <button style={styles.nextButton} onClick={onNextStory}>
          ⏭ Histoire suivante
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
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  emptyText: {
    fontSize: '16px',
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: '20px',
    lineHeight: 1.3,
  },
  body: {
    fontSize: '16px',
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    backgroundColor: COLORS.surface,
    borderTop: `1px solid ${COLORS.surfaceElevated}`,
  },
  generatingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: `3px solid ${COLORS.surfaceElevated}`,
    borderTop: `3px solid ${COLORS.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  generatingText: {
    fontSize: '16px',
    color: COLORS.textSecondary,
  },
  cancelButton: {
    backgroundColor: COLORS.accent,
    color: COLORS.textPrimary,
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  playButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.textPrimary,
    border: 'none',
    padding: '16px',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  playButtonActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  nextButton: {
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.textSecondary,
    border: 'none',
    padding: '12px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.accent,
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: '14px',
    flex: 1,
  },
  errorDismiss: {
    background: 'none',
    border: 'none',
    color: COLORS.textPrimary,
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 8px',
  },
};
