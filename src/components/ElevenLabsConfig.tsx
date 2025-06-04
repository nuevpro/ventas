
import React, { useState, useEffect } from 'react';
import { Save, TestTube, Volume2, User, Globe, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Comprehensive ElevenLabs voice database organized by categories
const ELEVENLABS_VOICES = {
  english: {
    male: {
      young: [
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', age: '20-30', accent: 'American', description: 'Joven americano, casual' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', age: '25-35', accent: 'American', description: 'Joven profesional americano' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', age: '25-30', accent: 'American', description: 'Joven americano, enérgico' },
      ],
      middle: [
        { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', age: '35-45', accent: 'British', description: 'Ejecutivo británico maduro' },
        { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', age: '40-50', accent: 'British', description: 'Autoritativo británico' },
        { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', age: '45-55', accent: 'American', description: 'Maduro americano profesional' },
        { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', age: '35-45', accent: 'American', description: 'Profesional americano' },
      ],
      elderly: [
        { id: 'cgSgspJ2msm6clMCkdW9', name: 'Marcus', age: '55-65', accent: 'British', description: 'Mayor británico distinguido' },
        { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', age: '60-70', accent: 'American', description: 'Mayor americano sabio' },
      ]
    },
    female: {
      young: [
        { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', age: '20-30', accent: 'American', description: 'Joven americana natural' },
        { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', age: '25-30', accent: 'British', description: 'Joven británica elegante' },
        { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', age: '20-28', accent: 'British', description: 'Joven británica sofisticada' },
      ],
      middle: [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', age: '30-40', accent: 'American', description: 'Profesional americana' },
        { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', age: '35-45', accent: 'British', description: 'Ejecutiva británica amigable' },
        { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', age: '30-40', accent: 'American', description: 'Profesional americana versátil' },
      ],
      elderly: [
        { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', age: '50-60', accent: 'American', description: 'Madura americana distinguida' },
        { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', age: '55-65', accent: 'British', description: 'Mayor británica refinada' },
      ]
    }
  },
  spanish: {
    male: [
      { id: 'g5CIjZEefAph4nQFvHAz', name: 'Diego', age: '30-40', accent: 'Mexican', description: 'Profesional mexicano' },
      { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Carlos', age: '35-45', accent: 'Spanish', description: 'Ejecutivo español' },
      { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Miguel', age: '25-35', accent: 'Colombian', description: 'Joven colombiano' },
    ],
    female: [
      { id: 'IKne3meq5aSn9XLyUdCD', name: 'Sofia', age: '25-35', accent: 'Mexican', description: 'Joven mexicana profesional' },
      { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Carmen', age: '30-40', accent: 'Spanish', description: 'Ejecutiva española' },
      { id: 'SAz9YHcvj6GT2YYXdXww', name: 'Lucia', age: '28-38', accent: 'Argentinian', description: 'Profesional argentina' },
    ]
  },
  french: {
    male: [
      { id: 'nPczCjzI2devNBz1zQrb', name: 'Pierre', age: '35-45', accent: 'Parisian', description: 'Ejecutivo parisino' },
      { id: 'iP95p4xoKVk53GoZ742B', name: 'Jean', age: '40-50', accent: 'French', description: 'Profesional francés maduro' },
    ],
    female: [
      { id: 'pqHfZKP75CvOlQylNhV4', name: 'Marie', age: '30-40', accent: 'Parisian', description: 'Ejecutiva parisina' },
      { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Camille', age: '25-35', accent: 'French', description: 'Joven francesa profesional' },
    ]
  },
  german: {
    male: [
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Hans', age: '40-50', accent: 'German', description: 'Ejecutivo alemán' },
      { id: 'VR6AewLTigWG4xSOukaG', name: 'Klaus', age: '35-45', accent: 'Austrian', description: 'Profesional austriaco' },
    ],
    female: [
      { id: 'ErXwobaYiN019PkySvjV', name: 'Greta', age: '30-40', accent: 'German', description: 'Ejecutiva alemana' },
      { id: 'cgSgspJ2msm6clMCkdW9', name: 'Ingrid', age: '35-45', accent: 'Swiss', description: 'Profesional suiza' },
    ]
  },
  italian: {
    male: [
      { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Marco', age: '30-40', accent: 'Italian', description: 'Ejecutivo italiano' },
      { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Giuseppe', age: '45-55', accent: 'Roman', description: 'Profesional romano maduro' },
    ],
    female: [
      { id: 'XB0fDUnXU5powFXDhCwa', name: 'Giulia', age: '28-38', accent: 'Italian', description: 'Ejecutiva italiana' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Francesca', age: '32-42', accent: 'Milanese', description: 'Profesional milanesa' },
    ]
  }
};

const ELEVENLABS_MODELS = [
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Más realista, emocional (29 idiomas)', latency: 'Alta calidad' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Baja latencia (32 idiomas)', latency: 'Baja latencia' },
  { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Solo inglés, baja latencia', latency: 'Muy baja latencia' },
  { id: 'eleven_multilingual_v1', name: 'Multilingual v1', description: 'Primer modelo multilingüe (10 idiomas)', latency: 'Media' },
];

const ElevenLabsConfig = () => {
  const [config, setConfig] = useState({
    defaultVoice: 'EXAVITQu4vr4xnSDxMaL',
    defaultModel: 'eleven_multilingual_v2',
    stability: 0.6,
    similarityBoost: 0.8,
    style: 0.3,
    useSpeakerBoost: true,
    autoCallMode: true,
    callIntroMessage: 'Hola, gracias por contactarnos. Mi nombre es {name} y estaré ayudándole hoy.',
    interruptionSensitivity: 0.7,
  });
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedGender, setSelectedGender] = useState('female');
  const [selectedAge, setSelectedAge] = useState('middle');
  const [testText, setTestText] = useState('Hola, esta es una prueba de la configuración de voz.');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const getVoicesByCategory = () => {
    const lang = ELEVENLABS_VOICES[selectedLanguage];
    if (!lang) return [];
    
    if (selectedLanguage === 'english') {
      const gender = lang[selectedGender];
      return gender?.[selectedAge] || [];
    } else {
      return lang[selectedGender] || [];
    }
  };

  const getAllVoices = () => {
    const allVoices = [];
    Object.entries(ELEVENLABS_VOICES).forEach(([lang, langData]) => {
      if (lang === 'english') {
        Object.entries(langData).forEach(([gender, genderData]) => {
          Object.entries(genderData).forEach(([age, voices]) => {
            allVoices.push(...voices.map(v => ({ ...v, language: lang, gender, age })));
          });
        });
      } else {
        Object.entries(langData).forEach(([gender, voices]) => {
          allVoices.push(...voices.map(v => ({ ...v, language: lang, gender })));
        });
      }
    });
    return allVoices;
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('elevenLabsConfig', JSON.stringify(config));
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de ElevenLabs se ha guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVoice = async () => {
    if (!testText.trim()) return;
    
    setIsTesting(true);
    try {
      const selectedVoice = getAllVoices().find(v => v.id === config.defaultVoice);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: testText,
          voice: selectedVoice?.name || 'Sarah',
          model: config.defaultModel,
          settings: {
            stability: config.stability,
            similarity_boost: config.similarityBoost,
            style: config.style,
            use_speaker_boost: config.useSpeakerBoost,
          }
        },
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        await audio.play();
        
        toast({
          title: "Prueba exitosa",
          description: "El audio se ha generado y reproducido correctamente.",
        });
      }
    } catch (error) {
      console.error('Test voice error:', error);
      toast({
        title: "Error en la prueba",
        description: "No se pudo generar el audio de prueba.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('elevenLabsConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="voices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voices">Selección de Voces</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
        </TabsList>

        <TabsContent value="voices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Catálogo de Voces ElevenLabs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language and Category Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">🇺🇸 Inglés</SelectItem>
                      <SelectItem value="spanish">🇪🇸 Español</SelectItem>
                      <SelectItem value="french">🇫🇷 Francés</SelectItem>
                      <SelectItem value="german">🇩🇪 Alemán</SelectItem>
                      <SelectItem value="italian">🇮🇹 Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">👨 Masculino</SelectItem>
                      <SelectItem value="female">👩 Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedLanguage === 'english' && (
                  <div className="space-y-2">
                    <Label>Edad</Label>
                    <Select value={selectedAge} onValueChange={setSelectedAge}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="young">🧑 Joven (20-30)</SelectItem>
                        <SelectItem value="middle">👨‍💼 Adulto (30-50)</SelectItem>
                        <SelectItem value="elderly">👴 Mayor (50+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Voice Selection */}
              <div className="space-y-4">
                <Label>Seleccionar Voz</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getVoicesByCategory().map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        config.defaultVoice === voice.id 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, defaultVoice: voice.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-8 w-8 text-gray-500" />
                        <div>
                          <h3 className="font-medium">{voice.name}</h3>
                          <p className="text-sm text-gray-500">{voice.description}</p>
                          <div className="flex space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {voice.age}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {voice.accent}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="h-5 w-5" />
                <span>Configuración de Audio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select value={config.defaultModel} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultModel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEVENLABS_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estabilidad ({config.stability})</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.stability}
                    onChange={(e) => setConfig(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Mayor estabilidad = menos variación emocional</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Similitud ({config.similarityBoost})</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.similarityBoost}
                    onChange={(e) => setConfig(prev => ({ ...prev, similarityBoost: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Mayor similitud = más fidelidad a la voz original</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Estilo ({config.style})</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.style}
                    onChange={(e) => setConfig(prev => ({ ...prev, style: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Mayor estilo = más expresividad emocional</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.useSpeakerBoost}
                      onChange={(e) => setConfig(prev => ({ ...prev, useSpeakerBoost: e.target.checked }))}
                    />
                    <span>Potenciador de Voz</span>
                  </Label>
                  <p className="text-xs text-gray-500">Mejora la claridad y volumen</p>
                </div>
              </div>

              {/* Test Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <Label>Probar Configuración</Label>
                <Textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Escriba el texto para probar la voz..."
                  rows={3}
                />
                <Button
                  onClick={handleTestVoice}
                  disabled={isTesting || !testText.trim()}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando audio...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Probar Voz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Modo Llamada Automática</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.autoCallMode}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoCallMode: e.target.checked }))}
                    id="autoCallMode"
                  />
                  <Label htmlFor="autoCallMode">Activar modo llamada automática</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Mensaje de introducción</Label>
                  <Textarea
                    value={config.callIntroMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, callIntroMessage: e.target.value }))}
                    placeholder="Mensaje inicial automático..."
                    rows={2}
                  />
                  <p className="text-xs text-gray-500">Use {`{name}`} para insertar el nombre de la voz seleccionada</p>
                </div>

                <div className="space-y-2">
                  <Label>Sensibilidad de interrupción ({config.interruptionSensitivity})</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.interruptionSensitivity}
                    onChange={(e) => setConfig(prev => ({ ...prev, interruptionSensitivity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Mayor sensibilidad = la IA se interrumpe más fácilmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Button onClick={handleSaveConfig} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </>
        )}
      </Button>
    </div>
  );
};

export default ElevenLabsConfig;
