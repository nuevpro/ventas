
import { useState, useEffect } from 'react';

export interface ElevenLabsConfig {
  defaultVoice: string;
  defaultModel: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  autoCallMode: boolean;
  callIntroMessage: string;
  interruptionSensitivity: number;
}

const DEFAULT_CONFIG: ElevenLabsConfig = {
  defaultVoice: 'EXAVITQu4vr4xnSDxMaL',
  defaultModel: 'eleven_multilingual_v2',
  stability: 0.6,
  similarityBoost: 0.8,
  style: 0.3,
  useSpeakerBoost: true,
  autoCallMode: true,
  callIntroMessage: 'Hola, gracias por contactarnos. Mi nombre es {name} y estaré ayudándole hoy.',
  interruptionSensitivity: 0.7,
};

export const useElevenLabsConfig = () => {
  const [config, setConfig] = useState<ElevenLabsConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración desde localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('elevenLabsConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading ElevenLabs config:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar configuración en localStorage cuando cambie
  const updateConfig = (updates: Partial<ElevenLabsConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      try {
        localStorage.setItem('elevenLabsConfig', JSON.stringify(newConfig));
      } catch (error) {
        console.error('Error saving ElevenLabs config:', error);
      }
      return newConfig;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.removeItem('elevenLabsConfig');
    } catch (error) {
      console.error('Error resetting ElevenLabs config:', error);
    }
  };

  return {
    config,
    updateConfig,
    resetConfig,
    isLoaded
  };
};
