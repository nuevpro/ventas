import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validate OpenAI API key
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
if (!openAIApiKey) {
  console.error('OPENAI_API_KEY environment variable is not set')
}

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to fetch with retry
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options)
    if (!response.ok && retries > 0) {
      console.log(`Retry ${MAX_RETRIES - retries + 1} - Status: ${response.status}`)
      await delay(RETRY_DELAY)
      return fetchWithRetry(url, options, retries - 1)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry ${MAX_RETRIES - retries + 1} - Error: ${error.message}`)
      await delay(RETRY_DELAY)
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate OpenAI API key before proceeding
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured')
    }

    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Extracting content from URL:', url)

    // Validate URL
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extraer contenido web con headers completos para simular navegador real
    const response = await fetchWithRetry(validUrl.toString(), {
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
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const html = await response.text()
    console.log('HTML content fetched, length:', html.length)
    
    try {
      const openAIResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en extracción y análisis de contenido web. Tu trabajo es extraer información completa y detallada de páginas web para entrenamientos de ventas. Siempre responde en español con información específica y útil.'
            },
            {
              role: 'user',
              content: `Analiza y extrae el contenido principal de esta página web: ${validUrl.toString()}\n\n${html.substring(0, 15000)}`
            }
          ],
          max_tokens: 4000,
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

      // Fallback response with basic extraction
      return new Response(JSON.stringify({
        url: validUrl.toString(),
        title: `Contenido de ${validUrl.hostname}`,
        content: extractedContent,
        aiSummary: `Contenido extraído de ${validUrl.hostname}`,
        keyPoints: ["Contenido procesado exitosamente"],
        salesInfo: extractedContent.substring(0, 300),
        objections: ["Verificar información actualizada"],
        extractedAt: new Date().toISOString(),
        status: 'completed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (aiError) {
      console.error('Error processing with AI:', aiError)
      
      // Fallback: Extraer contenido básico con regex
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1] : validUrl.hostname
      
      // Extraer texto visible con regex simple
      const bodyText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                           .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                           .replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim()
      
      return new Response(JSON.stringify({
        url: validUrl.toString(),
        title: title,
        content: bodyText.substring(0, 5000),
        aiSummary: `Contenido extraído de ${validUrl.hostname}`,
        keyPoints: ["Contenido extraído sin procesamiento AI"],
        salesInfo: "Información extraída sin análisis AI",
        objections: ["Verificar información manualmente"],
        extractedAt: new Date().toISOString(),
        status: 'completed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error in extract-web-content:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to extract web content',
        status: 'error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})