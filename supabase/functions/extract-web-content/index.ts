
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Extraer contenido web con headers completos para simular navegador real
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log('HTML content fetched, length:', html.length)
    
    // Procesar contenido con OpenAI para extraer información relevante
    const extractionPrompt = `Analiza y extrae COMPLETAMENTE el contenido principal de esta página web. Es crucial que proporciones información real y detallada.

URL: ${validUrl.toString()}

Instrucciones específicas para extracción:
1. **Título principal** de la página y subtítulos importantes
2. **Productos/servicios** ofrecidos con descripciones detalladas
3. **Precios, tarifas, costos** mencionados (incluye monedas y condiciones)
4. **Características principales** de productos/servicios
5. **Información de contacto** completa (teléfonos, emails, direcciones físicas)
6. **Horarios de atención** y disponibilidad
7. **Promociones y ofertas especiales** activas
8. **Información corporativa** (sobre la empresa, historia, misión)
9. **Testimonios y reseñas** de clientes si existen
10. **Datos técnicos** relevantes para ventas

Contenido HTML para análisis:
${html.substring(0, 8000)}

IMPORTANTE: Responde SOLO con la información extraída y estructurada en español, sin etiquetas HTML. Sé específico y detallado.`

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
            content: 'Eres un experto en extracción y análisis de contenido web. Tu trabajo es extraer información completa y detallada de páginas web para entrenamientos de ventas. Siempre responde en español con información específica y útil.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error:', openAIResponse.status, errorText)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const aiResult = await openAIResponse.json()
    const extractedContent = aiResult.choices[0]?.message?.content || 'No se pudo extraer contenido de la página web.'

    console.log('Content extracted successfully, length:', extractedContent.length)

    // Generar resumen con puntos clave
    const summaryPrompt = `Basándote en el siguiente contenido extraído de la página web ${validUrl.toString()}, genera un análisis estructurado para entrenamientos de ventas:

Contenido extraído:
${extractedContent}

Responde en formato JSON válido con esta estructura EXACTA:
{
  "summary": "Resumen ejecutivo en 2-3 párrafos sobre el negocio y sus ofertas",
  "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3", "punto clave 4", "punto clave 5"],
  "salesInfo": "Información específica y estratégica para equipos de ventas",
  "objections": ["posible objeción 1", "posible objeción 2", "posible objeción 3"]
}`

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
            content: 'Eres un analista experto que estructura información web para entrenamientos de ventas. Responde SIEMPRE en JSON válido y en español.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    let analysis
    try {
      if (summaryResponse.ok) {
        const summaryResult = await summaryResponse.json()
        const analysisText = summaryResult.choices[0]?.message?.content || '{}'
        analysis = JSON.parse(analysisText)
      } else {
        throw new Error('Summary generation failed')
      }
    } catch (error) {
      console.error('Error parsing analysis:', error)
      analysis = {
        summary: "Contenido extraído exitosamente de " + validUrl.hostname,
        keyPoints: ["Información web disponible", "Contenido procesado", "Datos para análisis"],
        salesInfo: extractedContent.substring(0, 300),
        objections: ["Verificar información actualizada", "Consultar condiciones específicas"]
      }
    }

    console.log('Web content extraction completed successfully')

    return new Response(JSON.stringify({
      url: validUrl.toString(),
      title: `Contenido de ${validUrl.hostname}`,
      content: extractedContent,
      aiSummary: analysis.summary,
      keyPoints: analysis.keyPoints,
      salesInfo: analysis.salesInfo,
      objections: analysis.objections,
      extractedAt: new Date().toISOString(),
      status: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in extract-web-content:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract web content',
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
