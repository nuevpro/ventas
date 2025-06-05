import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScrapedContent {
  id: string;
  url: string;
  title: string;
  content: string;
  aiSummary?: string;
  keyPoints?: string[];
  status: 'pending' | 'completed' | 'error';
  created_at: string;
}

const WebScrapingManager = () => {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load previously scraped content from knowledge_base
    const loadScrapedContent = async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('document_type', 'web_scraping')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedData: ScrapedContent[] = (data || []).map(item => ({
          id: item.id,
          url: item.source_url || '',
          title: item.title,
          content: item.content || '',
          aiSummary: item.ai_summary,
          keyPoints: item.key_points,
          status: item.extraction_status || 'completed',
          created_at: item.created_at || new Date().toISOString()
        }));

        setScrapedContent(formattedData);
      } catch (error) {
        console.error('Error loading scraped content:', error);
      }
    };

    loadScrapedContent();
  }, []);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const scrapeWebContent = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "URL inválida",
        description: "Por favor ingresa una URL válida (ej: https://example.com)",
        variant: "destructive",
      });
      return;
    }

    try {
      setScraping(true);
      toast({
        title: "Procesando",
        description: "Extrayendo contenido de la web, esto puede tomar unos momentos...",
      });

      console.log('Starting web scraping for:', url);

      // Usar la edge function para extracción real
      const { data, error } = await supabase.functions.invoke('extract-web-content', {
        body: { url }
      });

      if (error) {
        console.error('Error in web extraction:', error);
        throw new Error(error.message || 'Error al extraer contenido web');
      }

      console.log('Web content extracted successfully:', data);

      // Agregar a la base de conocimientos
      const { data: kbData, error: kbError } = await supabase
        .from('knowledge_base')
        .insert({
          title: data.title || `Contenido de ${new URL(url).hostname}`,
          content: data.content,
          document_type: 'web_scraping',
          tags: ['web', 'scraping', new URL(url).hostname],
          ai_summary: data.aiSummary,
          key_points: data.keyPoints,
          source_url: data.url,
          extraction_status: 'completed',
          processing_metadata: {
            salesInfo: data.salesInfo,
            objections: data.objections,
            extractedAt: data.extractedAt
          }
        })
        .select()
        .single();

      if (kbError) {
        console.error('Error saving to knowledge base:', kbError);
        throw new Error('Error al guardar en la base de conocimientos');
      }

      // Agregar a la lista local
      const newContent: ScrapedContent = {
        id: kbData.id,
        url: data.url,
        title: data.title || `Contenido de ${new URL(url).hostname}`,
        content: data.content,
        aiSummary: data.aiSummary,
        keyPoints: data.keyPoints,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      setScrapedContent(prev => [newContent, ...prev]);

      toast({
        title: "¡Éxito!",
        description: "Contenido web extraído y agregado a la base de conocimientos",
      });

      setUrl('');
    } catch (error) {
      console.error('Error scraping web content:', error);
      toast({
        title: "Error",
        description: `Error al extraer contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setScraping(false);
    }
  };

  const removeScrapedContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScrapedContent(prev => prev.filter(item => item.id !== id));

      toast({
        title: "¡Éxito!",
        description: "Contenido eliminado correctamente",
      });
    } catch (error) {
      console.error('Error removing scraped content:', error);
      toast({
        title: "Error",
        description: "Error al eliminar contenido",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Extracción de Contenido Web</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <label htmlFor="url">URL del sitio web</label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={scraping}
              />
              <Button 
                onClick={scrapeWebContent}
                disabled={scraping || !url.trim()}
              >
                {scraping ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extrayendo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Extraer
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="mb-2 font-medium">✅ Extracción Real de Contenido Web:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Procesamiento inteligente con IA para extraer información relevante</li>
              <li>Análisis automático de productos, servicios y precios</li>
              <li>Generación de resúmenes y puntos clave</li>
              <li>Integración directa con la base de conocimientos</li>
            </ul>
          </div>
        </div>

        {/* Scraped Content List */}
        <div className="space-y-4">
          <h3 className="font-medium">Contenido Extraído ({scrapedContent.length})</h3>
          
          {scrapedContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay contenido web extraído</p>
              <p className="text-sm">Ingresa una URL arriba para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scrapedContent.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {item.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : item.status === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                        )}
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline">Web IA</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {item.url}
                        </a>
                      </div>
                      
                      {item.aiSummary && (
                        <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm font-medium mb-1">Resumen IA:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.aiSummary}</p>
                        </div>
                      )}

                      {item.keyPoints && item.keyPoints.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Puntos clave:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.keyPoints.slice(0, 3).map((point, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                            {item.keyPoints.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.keyPoints.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.content.substring(0, 150)}...
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Extraído: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeScrapedContent(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebScrapingManager;