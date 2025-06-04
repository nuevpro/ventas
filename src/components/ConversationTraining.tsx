
import React from 'react';
import LiveTrainingInterface from './training/LiveTrainingInterface';

// Wrapper de compatibilidad para el componente anterior
interface ConversationTrainingProps {
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete: (evaluation: any) => void;
}

const ConversationTraining = ({ scenario, difficulty, onComplete }: ConversationTrainingProps) => {
  const config = {
    scenario,
    difficulty,
    clientEmotion: 'neutral',
    interactionMode: 'call'
  };

  return (
    <LiveTrainingInterface
      config={config}
      onComplete={onComplete}
      onBack={() => {}}
    />
  );
};

export default ConversationTraining;
