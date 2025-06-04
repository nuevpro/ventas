
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userResponse, scenario, knowledgeBase, expectedOutcomes } = await req.json();

    const evaluationPrompt = `Evalúa la siguiente respuesta del usuario en un contexto de entrenamiento.
    
    Escenario: ${scenario}
    Base de conocimiento: ${knowledgeBase}
    Resultados esperados: ${expectedOutcomes}
    Respuesta del usuario: ${userResponse}
    
    Proporciona una evaluación estructurada en JSON con:
    - score (0-100): puntuación general
    - accuracy (0-100): precisión factual
    - communication (0-100): habilidades de comunicación
    - areas_improvement: array de áreas a mejorar
    - positive_aspects: array de aspectos positivos
    - suggestions: array de sugerencias específicas
    - critical_errors: array de errores críticos detectados`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un evaluador experto en entrenamiento profesional. Responde solo en formato JSON válido.' },
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const evaluationText = data.choices[0].message.content;
    
    // Parse the JSON response
    const evaluation = JSON.parse(evaluationText);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in evaluate-response function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
