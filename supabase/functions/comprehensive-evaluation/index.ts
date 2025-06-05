
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EvaluationRequest {
  conversationLog: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: number;
  }>;
  scenario: {
    title: string;
    description: string;
    expected_outcomes?: any;
  };
  knowledgeBase: Array<{
    title: string;
    content: string;
  }>;
  sessionDuration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { conversationLog, scenario, knowledgeBase, sessionDuration }: EvaluationRequest = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construir el transcript de la conversación
    const conversationTranscript = conversationLog.map(msg => 
      `${msg.sender === 'user' ? 'CANDIDATO' : 'EVALUADOR'}: ${msg.content}`
    ).join('\n\n')

    // Construir contexto de conocimiento
    const knowledgeContext = knowledgeBase.map(kb => 
      `• ${kb.title}: ${kb.content.substring(0, 200)}...`
    ).join('\n')

    const evaluationPrompt = `
Eres un evaluador experto en simulaciones de entrenamiento. Analiza la siguiente conversación y proporciona una evaluación ESTRICTA y detallada.

ESCENARIO: ${scenario.title}
DESCRIPCIÓN: ${scenario.description}
DURACIÓN: ${Math.round(sessionDuration / 60)} minutos

BASE DE CONOCIMIENTO DISPONIBLE:
${knowledgeContext}

TRANSCRIPT DE LA CONVERSACIÓN:
${conversationTranscript}

CRITERIOS DE EVALUACIÓN (0-100 puntos):

1. CONOCIMIENTO Y PRECISIÓN (0-25 puntos):
   - ¿El candidato demostró conocimiento correcto del producto/servicio?
   - ¿Proporcionó información precisa basada en la base de conocimiento?
   - ¿Evitó dar información falsa o inventada?
   - PENALIZACIÓN SEVERA (-10 puntos) por cada información incorrecta o inventada

2. COMUNICACIÓN Y PROFESIONALISMO (0-25 puntos):
   - ¿Mantuvo un tono profesional durante toda la conversación?
   - ¿Utilizó lenguaje apropiado y cortés?
   - ¿Mostró escucha activa y empatía?
   - PENALIZACIÓN SEVERA (-15 puntos) por sarcasmo, grosería o desinterés

3. MANEJO DE OBJECIONES (0-25 puntos):
   - ¿Respondió adecuadamente a las objeciones presentadas?
   - ¿Proporcionó soluciones convincentes?
   - ¿Mantuvo la calma ante situaciones difíciles?

4. LOGRO DE OBJETIVOS (0-25 puntos):
   - ¿Cumplió con los objetivos del escenario?
   - ¿Condujo la conversación hacia resultados positivos?
   - ¿Demostró iniciativa y proactividad?

INSTRUCCIONES ESPECÍFICAS:
- Comienza la evaluación desde 0 puntos y suma según el desempeño
- Sé ESTRICTO: un desempeño promedio debe obtener 60-70 puntos
- Un desempeño excelente merece 85+ puntos
- Penaliza duramente las mentiras, información falsa y mal comportamiento
- Proporciona feedback específico y accionable

Responde en formato JSON con la siguiente estructura:
{
  "overall_score": número entre 0-100,
  "knowledge_score": número entre 0-25,
  "communication_score": número entre 0-25,
  "objection_handling_score": número entre 0-25,
  "objective_achievement_score": número entre 0-25,
  "strengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "areas_for_improvement": ["mejora1", "mejora2", "mejora3"],
  "specific_feedback": "feedback detallado en español",
  "critical_errors": ["error1", "error2"] o [],
  "recommendation": "recomendación específica para mejorar"
}
`

    console.log('Generating comprehensive evaluation...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un evaluador experto que proporciona análisis detallados y justos.' },
          { role: 'user', content: evaluationPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const evaluationText = data.choices[0]?.message?.content

    if (!evaluationText) {
      throw new Error('No evaluation generated')
    }

    // Intentar parsear el JSON de la evaluación
    let evaluation
    try {
      // Limpiar el texto para extraer solo el JSON
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing evaluation JSON:', parseError)
      // Crear evaluación por defecto si falla el parsing
      evaluation = {
        overall_score: 50,
        knowledge_score: 12,
        communication_score: 13,
        objection_handling_score: 12,
        objective_achievement_score: 13,
        strengths: ["Participó en la conversación", "Mantuvo el diálogo"],
        areas_for_improvement: ["Mejorar precisión de información", "Desarrollar habilidades de comunicación"],
        specific_feedback: "La evaluación no pudo ser procesada correctamente. Se recomienda revisar la conversación manualmente.",
        critical_errors: ["Error en el procesamiento de la evaluación"],
        recommendation: "Repetir el escenario con mayor preparación"
      }
    }

    // Asegurar que los puntajes estén dentro del rango
    evaluation.overall_score = Math.max(0, Math.min(100, evaluation.overall_score || 0))
    evaluation.knowledge_score = Math.max(0, Math.min(25, evaluation.knowledge_score || 0))
    evaluation.communication_score = Math.max(0, Math.min(25, evaluation.communication_score || 0))
    evaluation.objection_handling_score = Math.max(0, Math.min(25, evaluation.objection_handling_score || 0))
    evaluation.objective_achievement_score = Math.max(0, Math.min(25, evaluation.objective_achievement_score || 0))

    console.log('Evaluation generated successfully:', evaluation.overall_score, 'points')

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in comprehensive-evaluation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        overall_score: 0,
        specific_feedback: 'Error al generar la evaluación. Por favor intenta nuevamente.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
