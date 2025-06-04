
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent: string;
  age: 'young' | 'middle' | 'mature';
  style: string;
  language: string;
  country: string;
  description: string;
  useCase: string[];
}

const VoiceSelector = ({ onVoiceSelect, selectedVoice }: {
  onVoiceSelect: (voice: Voice) => void;
  selectedVoice?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const { toast } = useToast();

  const voices: Voice[] = [
    // Español - España
    {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Sarah',
      gender: 'female',
      accent: 'Peninsular',
      age: 'young',
      style: 'Profesional, clara',
      language: 'Español',
      country: 'España',
      description: 'Voz femenina profesional, perfecta para presentaciones de negocio',
      useCase: ['ventas', 'presentaciones', 'formación']
    },
    {
      id: 'JBFqnCBsd6RMkjVDRZzb',
      name: 'George',
      gender: 'male',
      accent: 'Peninsular',
      age: 'middle',
      style: 'Autoritario, seguro',
      language: 'Español',
      country: 'España',
      description: 'Voz masculina con autoridad, ideal para roles ejecutivos',
      useCase: ['entrevistas', 'liderazgo', 'negociación']
    },
    {
      id: 'XB0fDUnXU5powFXDhCwa',
      name: 'Charlotte',
      gender: 'female',
      accent: 'Peninsular',
      age: 'young',
      style: 'Amigable, cálida',
      language: 'Español',
      country: 'España',
      description: 'Voz femenina amigable, excelente para atención al cliente',
      useCase: ['servicio al cliente', 'soporte', 'recepción']
    },
    {
      id: 'onwK4e9ZLuTAKqWW03F9',
      name: 'Daniel',
      gender: 'male',
      accent: 'Peninsular',
      age: 'mature',
      style: 'Maduro, confiable',
      language: 'Español',
      country: 'España',
      description: 'Voz masculina madura, perfecta para roles de consultor senior',
      useCase: ['consultoría', 'formación', 'mentoring']
    },
    
    // Español - Latinoamérica
    {
      id: '9BWtsMINqrJLrRacOk9x',
      name: 'Aria',
      gender: 'female',
      accent: 'Mexicano',
      age: 'young',
      style: 'Natural, versátil',
      language: 'Español',
      country: 'México',
      description: 'Voz femenina natural con acento mexicano',
      useCase: ['general', 'educación', 'marketing']
    },
    {
      id: 'CwhRBWXzGAHq8TQ4Fs17',
      name: 'Roger',
      gender: 'male',
      accent: 'Argentino',
      age: 'mature',
      style: 'Distintivo, carismático',
      language: 'Español',
      country: 'Argentina',
      description: 'Voz masculina con acento argentino distintivo',
      useCase: ['ventas', 'persuasión', 'entretenimiento']
    },
    {
      id: 'IKne3meq5aSn9XLyUdCD',
      name: 'Charlie',
      gender: 'male',
      accent: 'Colombiano',
      age: 'young',
      style: 'Energético, dinámico',
      language: 'Español',
      country: 'Colombia',
      description: 'Voz masculina joven con acento colombiano',
      useCase: ['marketing', 'radio', 'presentaciones']
    },
    {
      id: 'SAz9YHcvj6GT2YYXdXww',
      name: 'River',
      gender: 'female',
      accent: 'Chileno',
      age: 'middle',
      style: 'Suave, elegante',
      language: 'Español',
      country: 'Chile',
      description: 'Voz femenina elegante con acento chileno',
      useCase: ['lujo', 'wellness', 'consultoría']
    },
    
    // English - US
    {
      id: 'TX3LPaxmHKxFdv7VOQHJ',
      name: 'Liam',
      gender: 'male',
      accent: 'American',
      age: 'young',
      style: 'Casual, moderno',
      language: 'English',
      country: 'USA',
      description: 'Young American male voice, casual and modern',
      useCase: ['tech', 'startups', 'casual business']
    },
    {
      id: 'Xb7hH8MSUJpSbSDYk0k2',
      name: 'Alice',
      gender: 'female',
      accent: 'American',
      age: 'middle',
      style: 'Professional, warm',
      language: 'English',
      country: 'USA',
      description: 'Professional American female voice with warmth',
      useCase: ['corporate', 'training', 'presentations']
    },
    
    // English - UK
    {
      id: 'XrExE9yKIg1WjnnlVkGX',
      name: 'Matilda',
      gender: 'female',
      accent: 'British',
      age: 'young',
      style: 'Sophisticated, clear',
      language: 'English',
      country: 'UK',
      description: 'Sophisticated British female voice',
      useCase: ['luxury', 'education', 'formal']
    },
    {
      id: 'bIHbv24MWmeRgasZH58o',
      name: 'Will',
      gender: 'male',
      accent: 'British',
      age: 'middle',
      style: 'Authoritative, refined',
      language: 'English',
      country: 'UK',
      description: 'Refined British male voice with authority',
      useCase: ['executive', 'luxury', 'formal presentations']
    }
  ];

  const countries = [...new Set(voices.map(v => v.country))];
  const languages = [...new Set(voices.map(v => v.language))];

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.style.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || voice.gender === filterGender;
    const matchesLanguage = filterLanguage === 'all' || voice.language === filterLanguage;
    const matchesAge = filterAge === 'all' || voice.age === filterAge;
    
    return matchesSearch && matchesGender && matchesLanguage && matchesAge;
  });

  const playVoicePreview = async (voice: Voice) => {
    if (playingVoice === voice.id) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voice.id);
    
    try {
      const testText = voice.language === 'Español' 
        ? `Hola, soy ${voice.name}. Así suena mi voz en una conversación de entrenamiento. Estoy aquí para ayudarte a practicar.`
        : `Hello, I'm ${voice.name}. This is how my voice sounds in a training conversation. I'm here to help you practice.`;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: testText,
          voice: voice.name,
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        
        audio.onended = () => setPlayingVoice(null);
        audio.onerror = () => {
          setPlayingVoice(null);
          toast({
            title: "Error",
            description: "No se pudo reproducir el audio de prueba",
            variant: "destructive"
          });
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setPlayingVoice(null);
      toast({
        title: "Error",
        description: "No se pudo generar el audio de prueba",
        variant: "destructive"
      });
    }
  };

  const getGenderColor = (gender: string) => {
    return gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700';
  };

  const getAgeColor = (age: string) => {
    const colors = {
      young: 'bg-green-100 text-green-700',
      middle: 'bg-yellow-100 text-yellow-700',
      mature: 'bg-purple-100 text-purple-700'
    };
    return colors[age as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nombre, estilo, descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Idioma</label>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {languages.map(language => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Género</label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Edad</label>
              <Select value={filterAge} onValueChange={setFilterAge}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="young">Joven</SelectItem>
                  <SelectItem value="middle">Mediana</SelectItem>
                  <SelectItem value="mature">Madura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterGender('all');
                  setFilterLanguage('all');
                  setFilterAge('all');
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de voces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((voice) => (
          <Card 
            key={voice.id} 
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedVoice === voice.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => onVoiceSelect(voice)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{voice.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{voice.country}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoicePreview(voice);
                  }}
                  disabled={playingVoice !== null}
                >
                  {playingVoice === voice.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {voice.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getGenderColor(voice.gender)}>
                  {voice.gender === 'female' ? 'Femenino' : 'Masculino'}
                </Badge>
                <Badge className={getAgeColor(voice.age)}>
                  {voice.age === 'young' ? 'Joven' : voice.age === 'middle' ? 'Mediana' : 'Madura'}
                </Badge>
                <Badge variant="outline">{voice.accent}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Estilo: {voice.style}
                </div>
                <div className="flex flex-wrap gap-1">
                  {voice.useCase.map((useCase, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedVoice === voice.id && (
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Voz Seleccionada
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredVoices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron voces que coincidan con los filtros aplicados.
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
