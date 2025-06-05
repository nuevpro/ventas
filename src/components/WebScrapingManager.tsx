
import React, { useState } from 'react';
import { Globe, Plus, Trash2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScrapedContent {
  id: string;
  url: string;
  title: string;
  content: string;
  status: 'pending' | 'completed' | 'error';
  created_at: string;
}

const WebScrapingManager = () => {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>([]);
  const { toast } = useToast();

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
      console.log('Starting web scraping for:', url);

      // Simulación de scraping - en un entorno real necesitarías un edge function
      const mockScrapedData = {
        title: `Contenido de ${new URL(url).hostname}`,
        content: `Este es contenido extraído de la página web ${url}. En un entorno de producción, aquí aparecería el contenido real extraído de la página web utilizando técnicas de web scraping.`,
        url: url,
        status: 'completed' as const
      };

      // Agregar a la base de conocimientos
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: mockScrapedData.title,
          content: mockScrapedData.content,
          document_type: 'web_scraping',
          tags: ['web', 'scraping', new URL(url).hostname]
        })
        .select()
        .single();

      if (error) throw error;

      // Agregar a la lista local
      const newContent: ScrapedContent = {
        id: data.id,
        ...mockScrapedData,
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
            <Label htmlFor="url">URL del sitio web</Label>
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
                    <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
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
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">Información sobre web scraping:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>El contenido extraído se agregará automáticamente a la base de conocimientos</li>
              <li>Asegúrate de tener permisos para extraer contenido del sitio web</li>
              <li>El proceso puede tomar unos segundos dependiendo del tamaño de la página</li>
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
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline">Web</Badge>
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
