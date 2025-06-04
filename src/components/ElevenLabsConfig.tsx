
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
import { getAllVoiceProfiles } from '@/utils/randomVoiceSelector';

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
  const [testText, setTestText] = useState('Hola, esta es una prueba de la configuración de voz.');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const voiceProfiles = getAllVoiceProfiles();

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem('elevenLabsConfig');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig(prev => ({ ...prev, ...parsed }));
          console.log('Configuración cargada:', parsed);
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    };
    
    loadConfig();
  }, []);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      console.log('Actualizando configuración:', key, value);
      return newConfig;
    });
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('elevenLabsConfig', JSON.stringify(config));
      console.log('Configuración guardada:', config);
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de ElevenLabs se ha guardado correctamente.",
      });
    } catch (error) {
      console.error('Error guardando configuración:', error);
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
      const selectedVoice = voiceProfiles.find(v => v.id === config.defaultVoice);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: testText,
          voice: config.defaultVoice,
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
          description: `Audio generado con ${selectedVoice?.name || 'voz seleccionada'}`,
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
                <span>Catálogo de Voces</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-4">
                <Label>Seleccionar Voz Principal</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {voiceProfiles.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        config.defaultVoice === voice.id 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleConfigChange('defaultVoice', voice.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-8 w-8 text-gray-500" />
                        <div>
                          <h3 className="font-medium">{voice.name}</h3>
                          <p className="text-sm text-gray-500">{voice.description}</p>
                          <div className="flex space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
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
                <Select 
                  value={config.defaultModel} 
                  onValueChange={(value) => handleConfigChange('defaultModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modelo" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Estabilidad: {config.stability.toFixed(1)}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.stability}
                    onChange={(e) => handleConfigChange('stability', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Mayor estabilidad = menos variación emocional</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Similitud: {config.similarityBoost.toFixed(1)}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.similarityBoost}
                    onChange={(e) => handleConfigChange('similarityBoost', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Mayor similitud = más fidelidad a la voz original</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Estilo: {config.style.toFixed(1)}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.style}
                    onChange={(e) => handleConfigChange('style', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Mayor estilo = más expresividad emocional</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="speakerBoost"
                      checked={config.useSpeakerBoost}
                      onChange={(e) => handleConfigChange('useSpeakerBoost', e.target.checked)}
                    />
                    <Label htmlFor="speakerBoost">Potenciador de Voz</Label>
                  </div>
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
                    onChange={(e) => handleConfigChange('autoCallMode', e.target.checked)}
                    id="autoCallMode"
                  />
                  <Label htmlFor="autoCallMode">Activar modo llamada automática</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Mensaje de introducción</Label>
                  <Textarea
                    value={config.callIntroMessage}
                    onChange={(e) => handleConfigChange('callIntroMessage', e.target.value)}
                    placeholder="Mensaje inicial automático..."
                    rows={2}
                  />
                  <p className="text-xs text-gray-500">Use {`{name}`} para insertar el nombre de la voz seleccionada</p>
                </div>

                <div className="space-y-2">
                  <Label>Sensibilidad de interrupción: {config.interruptionSensitivity.toFixed(1)}</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.interruptionSensitivity}
                    onChange={(e) => handleConfigChange('interruptionSensitivity', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
