
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Perfiles de cliente más realistas por escenario
const clientProfiles = {
  'sales-cold-call': {
    personality: 'Cliente ocupado y escéptico que recibe muchas llamadas comerciales. Inicialmente desinteresado pero puede ser persuadido con valor claro.',
    objections: ['No tengo tiempo', 'Ya tengo proveedor', 'No me interesa', 'Envíeme información por email'],
    voice: 'George'
  },
  'sales-objection-handling': {
    personality: 'Cliente con objeciones específicas sobre precio, tiempo de implementación o características del producto.',
    objections: ['Es muy caro', 'No tenemos presupuesto', 'Necesitamos más tiempo para decidir', 'La competencia ofrece más'],
    voice: 'Charlotte'
  },
  'recruitment-interview': {
    personality: 'Reclutador profesional que evalúa competencias técnicas y soft skills. Hace preguntas específicas y profundiza en experiencias.',
    objections: ['Cuénteme sobre su experiencia', 'Por qué dejó su trabajo anterior', 'Cuáles son sus debilidades'],
    voice: 'Sarah'
  },
  'education-presentation': {
    personality: 'Audiencia de estudiantes o profesionales con diferentes niveles de conocimiento. Hace preguntas para clarificar conceptos.',
    objections: ['No entiendo ese concepto', 'Puede dar un ejemplo', 'Cómo se aplica en la práctica'],
    voice: 'Daniel'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, scenario, userProfile, difficulty, conversationHistory = [] } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const clientProfile = clientProfiles[scenario] || clientProfiles['sales-cold-call'];
    
    // Ajustar la personalidad según la dificultad
    const difficultyAdjustments = {
      beginner: 'Sé más receptivo y colaborativo. Acepta propuestas razonables más fácilmente.',
      intermediate: 'Muestra interés moderado pero presenta objeciones típicas. Requiere persuasión.',
      advanced: 'Sé muy exigente y escéptico. Presenta múltiples objeciones y requiere argumentos sólidos.'
    };

    const systemPrompt = `Eres un ${scenario.includes('sales') ? 'cliente potencial' : scenario.includes('recruitment') ? 'entrevistador profesional' : 'miembro de la audiencia'} realista en una simulación de entrenamiento.

PERFIL DEL PERSONAJE:
${clientProfile.personality}

NIVEL DE DIFICULTAD: ${difficulty}
${difficultyAdjustments[difficulty]}

INSTRUCCIONES ESPECÍFICAS:
- Mantén un tono profesional pero natural
- ${scenario.includes('sales') ? 'Como cliente, muestra interés gradual si el vendedor presenta valor claro' : ''}
- ${scenario.includes('recruitment') ? 'Como entrevistador, evalúa las respuestas y haz preguntas de seguimiento relevantes' : ''}
- Presenta objeciones o preguntas apropiadas según el contexto
- Responde de manera concisa (2-3 oraciones máximo)
- Si el usuario comete errores graves, reacciona de forma realista
- Usa un lenguaje natural y coloquial apropiado para el contexto empresarial

POSIBLES OBJECIONES/PREGUNTAS A USAR:
${clientProfile.objections.join(', ')}

CONTEXTO DE LA CONVERSACIÓN:
${conversationHistory.slice(-3).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Responde como el personaje correspondiente de manera natural y realista.`;

    console.log('Processing conversation request for scenario:', scenario);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 400,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI conversation response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      voice: clientProfile.voice,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-conversation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
