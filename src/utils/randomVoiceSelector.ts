
interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  personality: string;
  accent: string;
  emotionalTone: string;
  description: string;
}

const voiceProfiles: VoiceProfile[] = [
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    gender: 'female',
    personality: 'Profesional y directa',
    accent: 'Estadounidense',
    emotionalTone: 'Segura y determinada',
    description: 'Una profesional experimentada con tono autoritario'
  },
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    gender: 'male',
    personality: 'Analítico y detallista',
    accent: 'Británico',
    emotionalTone: 'Escéptico pero respetuoso',
    description: 'Un ejecutivo maduro que evalúa cada propuesta cuidadosamente'
  },
  {
    id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Charlotte',
    gender: 'female',
    personality: 'Amigable pero exigente',
    accent: 'Canadiense',
    emotionalTone: 'Optimista con expectativas altas',
    description: 'Una compradora entusiasta que busca el mejor valor'
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    gender: 'male',
    personality: 'Conservador y cauteloso',
    accent: 'Australiano',
    emotionalTone: 'Prudente y reflexivo',
    description: 'Un tomador de decisiones que prefiere analizar todas las opciones'
  },
  {
    id: '9BWtsMINqrJLrRacOk9x',
    name: 'Aria',
    gender: 'female',
    personality: 'Enérgica y emprendedora',
    accent: 'Mexicano',
    emotionalTone: 'Entusiasta y dinámica',
    description: 'Una joven empresaria siempre buscando innovación'
  },
  {
    id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'Roger',
    gender: 'male',
    personality: 'Experimentado y sabio',
    accent: 'Argentino',
    emotionalTone: 'Calmado pero incisivo',
    description: 'Un veterano de la industria con alta experiencia'
  },
  {
    id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    gender: 'male',
    personality: 'Joven y curioso',
    accent: 'Irlandés',
    emotionalTone: 'Inquisitivo y abierto',
    description: 'Un millennials interesado en tecnología y sostenibilidad'
  },
  {
    id: 'SAz9YHcvj6GT2YYXdXww',
    name: 'River',
    gender: 'female',
    personality: 'Creativa y visionaria',
    accent: 'Chileno',
    emotionalTone: 'Inspiradora y apasionada',
    description: 'Una directora creativa que valora la originalidad'
  }
];

export interface RandomVoiceSelection {
  voiceId: string;
  voiceName: string;
  personality: string;
  emotionalContext: string;
  conversationStyle: string;
}

export const getRandomVoice = (): RandomVoiceSelection => {
  const randomProfile = voiceProfiles[Math.floor(Math.random() * voiceProfiles.length)];
  
  // Generar contexto emocional adicional aleatorio
  const emotionalStates = [
    'motivado por encontrar soluciones',
    'con tiempo limitado para decidir',
    'evaluando múltiples opciones',
    'buscando la mejor relación calidad-precio',
    'preocupado por los resultados',
    'interesado en innovación',
    'enfocado en eficiencia',
    'priorizando la seguridad'
  ];
  
  const conversationStyles = [
    'Prefiere conversaciones directas y al grano',
    'Le gusta explorar detalles y hacer preguntas',
    'Busca establecer una conexión personal primero',
    'Evalúa pros y contras sistemáticamente',
    'Necesita ejemplos concretos y casos de éxito',
    'Valora la transparencia y honestidad',
    'Se enfoca en beneficios a largo plazo',
    'Toma decisiones basadas en datos'
  ];
  
  const randomEmotionalState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
  const randomConversationStyle = conversationStyles[Math.floor(Math.random() * conversationStyles.length)];
  
  return {
    voiceId: randomProfile.id,
    voiceName: randomProfile.name,
    personality: `${randomProfile.personality} - ${randomProfile.emotionalTone}`,
    emotionalContext: `Cliente ${randomEmotionalState}`,
    conversationStyle: randomConversationStyle
  };
};

export const getAllVoiceProfiles = (): VoiceProfile[] => {
  return voiceProfiles;
};
