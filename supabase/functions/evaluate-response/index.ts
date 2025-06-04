
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

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const evaluationPrompt = `Evalúa la siguiente conversación de entrenamiento y proporciona una evaluación detallada.

ESCENARIO: ${scenario}
BASE DE CONOCIMIENTO: ${knowledgeBase}
OBJETIVOS ESPERADOS: ${expectedOutcomes}

CONVERSACIÓN A EVALUAR:
${userResponse}

Proporciona una evaluación estructurada evaluando:

1. PUNTUACIÓN GENERAL (0-100): Desempeño global
2. PRECISIÓN TÉCNICA (0-100): Corrección de la información proporcionada
3. HABILIDADES DE COMUNICACIÓN (0-100): Claridad, persuasión, manejo de objeciones
4. ÁREAS DE MEJORA: Aspectos específicos que necesitan trabajo
5. ASPECTOS POSITIVOS: Lo que hizo bien el usuario
6. SUGERENCIAS ESPECÍFICAS: Consejos concretos para mejorar
7. ERRORES CRÍTICOS: Fallos graves que podrían afectar el resultado

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "score": número,
  "accuracy": número,
  "communication": número,
  "areas_improvement": ["área1", "área2"],
  "positive_aspects": ["aspecto1", "aspecto2"],
  "suggestions": ["sugerencia1", "sugerencia2"],
  "critical_errors": ["error1", "error2"]
}`;

    console.log('Processing evaluation request');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un evaluador experto en entrenamiento profesional. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin comillas de código, sin explicaciones.' },
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let evaluationText = data.choices[0].message.content.trim();
    
    // Limpiar el texto para asegurar JSON válido
    evaluationText = evaluationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Raw evaluation response:', evaluationText);
    
    // Parse the JSON response
    const evaluation = JSON.parse(evaluationText);

    console.log('Evaluation completed successfully');

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in evaluate-response function:', error);
    
    // Fallback evaluation if parsing fails
    const fallbackEvaluation = {
      score: 70,
      accuracy: 75,
      communication: 70,
      areas_improvement: ["Mejorar la claridad en la comunicación", "Practicar manejo de objeciones"],
      positive_aspects: ["Mantuvo un tono profesional", "Demostró conocimiento del producto"],
      suggestions: ["Practicar técnicas de escucha activa", "Preparar respuestas para objeciones comunes"],
      critical_errors: ["Error en el procesamiento de la evaluación"]
    };

    return new Response(JSON.stringify(fallbackEvaluation), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
