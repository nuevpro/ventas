
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database, CheckCircle } from 'lucide-react';

const SampleDataGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const generateSampleData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sample-data');
      
      if (error) throw error;

      toast({
        title: "¡Datos creados exitosamente!",
        description: `Se generaron ${data.counts.scenarios} escenarios, ${data.counts.behaviors} comportamientos, ${data.counts.knowledgeBase} bases de conocimiento y ${data.counts.challenges} desafíos.`,
      });

      setCompleted(true);
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar los datos de ejemplo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ¡Datos generados exitosamente!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Se han creado múltiples escenarios, comportamientos, bases de conocimiento y desafíos para todas las categorías.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Generar Datos de Ejemplo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Genera contenido de ejemplo para poblar la aplicación con datos realistas:
        </p>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
            10+ escenarios de entrenamiento (ventas, servicio, educación, etc.)
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            10+ comportamientos de IA personalizados
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
            10+ artículos de base de conocimiento
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
            10+ desafíos individuales y de equipo
          </li>
        </ul>

        <Button 
          onClick={generateSampleData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando datos...
            </>
          ) : (
            'Generar Datos de Ejemplo'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleDataGenerator;
