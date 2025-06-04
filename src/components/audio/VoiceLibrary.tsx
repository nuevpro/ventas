
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Volume2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  gender: 'Male' | 'Female';
  age: 'Young' | 'Middle Aged' | 'Old';
  accent: string;
  use_case: string;
  preview_url?: string;
}

interface VoiceLibraryProps {
  selectedVoice?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
}

const VoiceLibrary = ({ selectedVoice, onVoiceSelect }: VoiceLibraryProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Lista completa de voces de ElevenLabs organizadas por categorías
  const elevenLabsVoices: Voice[] = [
    // Voces Profesionales
    { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', category: 'Profesional', description: 'Voz profesional femenina', gender: 'Female', age: 'Middle Aged', accent: 'American', use_case: 'Ventas, Presentaciones' },
    { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'Profesional', description: 'Voz masculina autoritaria', gender: 'Male', age: 'Middle Aged', accent: 'American', use_case: 'Liderazgo, Capacitación' },
    { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'Profesional', description: 'Voz masculina profunda', gender: 'Male', age: 'Middle Aged', accent: 'American', use_case: 'Ventas B2B' },
    { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', category: 'Profesional', description: 'Voz femenina madura', gender: 'Female', age: 'Old', accent: 'British', use_case: 'Consultoría, Educación' },
    
    // Voces Jóvenes
    { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'Joven', description: 'Voz joven energética', gender: 'Female', age: 'Young', accent: 'American', use_case: 'Tech, Startups' },
    { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', category: 'Joven', description: 'Voz masculina joven', gender: 'Male', age: 'Young', accent: 'British', use_case: 'Tecnología, Gaming' },
    { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', category: 'Joven', description: 'Voz juvenil británica', gender: 'Male', age: 'Young', accent: 'British', use_case: 'Reclutamiento Tech' },
    
    // Voces Internacionales
    { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'Internacional', description: 'Voz masculina irlandesa', gender: 'Male', age: 'Middle Aged', accent: 'Irish', use_case: 'Ventas Internacionales' },
    { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'Internacional', description: 'Voz femenina sueca', gender: 'Female', age: 'Young', accent: 'Swedish', use_case: 'Mercados Nórdicos' },
    { voice_id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', category: 'Internacional', description: 'Voz femenina australiana', gender: 'Female', age: 'Middle Aged', accent: 'Australian', use_case: 'Mercado APAC' },
    
    // Voces Especializadas
    { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', category: 'Especializada', description: 'Voz masculina profunda británica', gender: 'Male', age: 'Middle Aged', accent: 'British', use_case: 'Finanzas, Legal' },
    { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Especializada', description: 'Voz femenina cálida americana', gender: 'Female', age: 'Young', accent: 'American', use_case: 'Healthcare, Educación' },
    { voice_id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Sam', category: 'Especializada', description: 'Voz masculina versátil', gender: 'Male', age: 'Young', accent: 'American', use_case: 'Customer Service' },
  ];

  useEffect(() => {
    setVoices(elevenLabsVoices);
  }, []);

  const testVoice = async (voiceId: string, voiceName: string) => {
    if (playingVoice === voiceId) {
      stopAudio();
      return;
    }

    setLoading(true);
    setPlayingVoice(voiceId);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: `Hola, soy ${voiceName}. Esta es una prueba de mi voz para entrenamiento de ventas.`,
          voice: voiceId,
          model: 'eleven_multilingual_v2'
        },
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        setAudioElement(audio);

        audio.onended = () => {
          setPlayingVoice(null);
          setAudioElement(null);
        };

        audio.onerror = () => {
          setPlayingVoice(null);
          setAudioElement(null);
          toast({
            title: "Error de audio",
            description: "No se pudo reproducir la voz de prueba",
            variant: "destructive",
          });
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Error testing voice:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la voz de prueba",
        variant: "destructive",
      });
      setPlayingVoice(null);
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
    }
    setPlayingVoice(null);
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    onVoiceSelect(voiceId, voiceName);
    toast({
      title: "Voz seleccionada",
      description: `Has seleccionado la voz de ${voiceName}`,
    });
  };

  const getVoicesByCategory = (category: string) => {
    return voices.filter(voice => voice.category === category);
  };

  const categories = ['Profesional', 'Joven', 'Internacional', 'Especializada'];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Biblioteca de Voces</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona la voz perfecta para tu simulación de entrenamiento
        </p>
      </div>

      <Tabs defaultValue="Profesional" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getVoicesByCategory(category).map((voice) => (
                <Card 
                  key={voice.voice_id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedVoice === voice.voice_id 
                      ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{voice.name}</CardTitle>
                      {selectedVoice === voice.voice_id && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{voice.gender}</Badge>
                      <Badge variant="outline">{voice.age}</Badge>
                      <Badge variant="outline">{voice.accent}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {voice.description}
                    </p>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Ideal para: {voice.use_case}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVoice(voice.voice_id, voice.name)}
                        disabled={loading}
                        className="flex-1"
                      >
                        {playingVoice === voice.voice_id ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Probar
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleVoiceSelect(voice.voice_id, voice.name)}
                        size="sm"
                        className="flex-1"
                        variant={selectedVoice === voice.voice_id ? "default" : "outline"}
                      >
                        {selectedVoice === voice.voice_id ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Seleccionada
                          </>
                        ) : (
                          'Seleccionar'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default VoiceLibrary;
