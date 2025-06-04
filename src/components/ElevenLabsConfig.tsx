
import React, { useState, useEffect } from 'react';
import { Save, TestTube, Volume2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Profesional femenina' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Ejecutivo masculino' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Amigable femenina' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Autoritativo masculino' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Natural femenina' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Maduro masculino' },
];

const ELEVENLABS_MODELS = [
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Más realista, emocional (29 idiomas)' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Baja latencia (32 idiomas)' },
  { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Solo inglés, baja latencia' },
];

const ElevenLabsConfig = () => {
  const [config, setConfig] = useState({
    defaultVoice: 'EXAVITQu4vr4xnSDxMaL',
    defaultModel: 'eleven_multilingual_v2',
    stability: 0.6,
    similarityBoost: 0.8,
    style: 0.3,
    useSpeakerBoost: true,
  });
  const [testText, setTestText] = useState('Hola, esta es una prueba de la configuración de voz.');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Save configuration to localStorage for now
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
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: testText,
          voice: ELEVENLABS_VOICES.find(v => v.id === config.defaultVoice)?.name || 'Sarah',
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
    // Load saved configuration
    const savedConfig = localStorage.getItem('elevenLabsConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Configuración de ElevenLabs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <Label>Voz por Defecto</Label>
            <Select value={config.defaultVoice} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultVoice: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ELEVENLABS_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-sm text-gray-500">{voice.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Modelo por Defecto</Label>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ElevenLabsConfig;
