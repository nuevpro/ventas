
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      throw new Error('URL is required')
    }

    console.log('Extracting content from URL:', url)

    // Validar URL
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    // Extraer contenido web
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    
    // Procesar contenido con OpenAI para extraer información relevante
    const extractionPrompt = `
Extrae el contenido principal de esta página web y estructura la información de manera útil para entrenamiento de ventas.

Incluye:
1. Título principal
2. Información sobre productos/servicios
3. Precios si están disponibles
4. Características principales
5. Información de contacto
6. Cualquier dato relevante para ventas

HTML de la página:
${html.substring(0, 8000)}...

Responde en español con un formato estructurado y limpio, sin etiquetas HTML.
`

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en extraer y estructurar información web para entrenamientos de ventas. Extrae solo información relevante y útil.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    })

    if (!openAIResponse.ok) {
      throw new Error('Failed to process content with AI')
    }

    const aiResult = await openAIResponse.json()
    const extractedContent = aiResult.choices[0]?.message?.content || html.substring(0, 1000)

    // Generar resumen con puntos clave
    const summaryPrompt = `
Basándote en el siguiente contenido extraído de una página web, genera:

1. Un resumen ejecutivo (2-3 párrafos)
2. Lista de puntos clave (5-7 puntos principales)
3. Información relevante para ventas
4. Posibles objeciones y respuestas

Contenido extraído:
${extractedContent}

Responde en formato JSON con las siguientes propiedades:
- summary: string
- keyPoints: string[]
- salesInfo: string
- objections: string[]
`

    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un analista experto que estructura información para entrenamientos de ventas. Responde siempre en JSON válido.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    })

    let analysis
    try {
      const summaryResult = await summaryResponse.json()
      const analysisText = summaryResult.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(analysisText)
    } catch (error) {
      console.error('Error parsing analysis:', error)
      analysis = {
        summary: "Contenido extraído exitosamente",
        keyPoints: ["Información procesada", "Contenido disponible"],
        salesInfo: extractedContent.substring(0, 200),
        objections: []
      }
    }

    console.log('Content extraction completed successfully')

    return new Response(JSON.stringify({
      url: validUrl.toString(),
      title: `Contenido de ${validUrl.hostname}`,
      content: extractedContent,
      aiSummary: analysis.summary,
      keyPoints: analysis.keyPoints,
      salesInfo: analysis.salesInfo,
      objections: analysis.objections,
      extractedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in extract-web-content:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract web content'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
