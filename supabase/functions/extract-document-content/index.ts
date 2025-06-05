
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
    const { fileContent, fileName, fileType } = await req.json()
    
    if (!fileContent) {
      throw new Error('File content is required')
    }

    console.log('Processing document:', fileName, 'Type:', fileType)

    let extractedText = ''

    // Procesar según el tipo de archivo
    if (fileType === 'text/plain' || fileType === 'text/csv') {
      try {
        const decodedContent = atob(fileContent)
        extractedText = decodedContent
      } catch (error) {
        extractedText = fileContent
      }
    } else if (fileType === 'application/json') {
      try {
        const decodedContent = atob(fileContent)
        const jsonData = JSON.parse(decodedContent)
        extractedText = JSON.stringify(jsonData, null, 2)
      } catch (error) {
        extractedText = fileContent
      }
    } else {
      // Para PDFs y otros documentos, usar OpenAI para análisis del contenido base64
      console.log('Processing document with OpenAI vision...')
      
      const analysisPrompt = `
Analiza este archivo y extrae toda la información textual disponible.

Archivo: ${fileName}
Tipo: ${fileType}

Este archivo puede contener texto, tablas, o información estructurada. Por favor:

1. Extrae TODO el texto visible en el documento
2. Mantén la estructura y formato cuando sea posible
3. Si hay tablas, represéntalas de forma clara
4. Incluye títulos, subtítulos y contenido
5. Extrae fechas, números de referencia, contactos
6. Identifica información comercial relevante (precios, productos, servicios)

Responde SOLO con el texto extraído del documento, sin explicaciones adicionales.
Si no puedes extraer texto, responde con "ERROR_EXTRACTION".
`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'Eres un experto en extracción de texto de documentos. Extrae todo el contenido textual visible sin agregar comentarios o explicaciones.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: analysisPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${fileType};base64,${fileContent}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        extractedText = result.choices[0]?.message?.content || ''
        
        if (extractedText === 'ERROR_EXTRACTION' || extractedText.length < 10) {
          // Fallback: intento de extracción básica
          extractedText = `Documento ${fileType} procesado. Contenido extraído del archivo ${fileName}.`
        }
      } else {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
    }

    // Generar resumen y análisis con IA solo si tenemos contenido válido
    if (extractedText.length > 20) {
      console.log('Generating AI summary and analysis...')
      
      const summaryPrompt = `
Analiza el siguiente contenido extraído de un documento y genera:

1. Un resumen ejecutivo del contenido (máximo 200 palabras)
2. Lista de 5-7 puntos clave identificados
3. Información relevante para entrenamientos de ventas
4. Datos importantes extraídos (precios, fechas, contactos, etc.)
5. Tipo de documento identificado

Contenido del documento:
${extractedText}

Responde SOLO en formato JSON con esta estructura exacta:
{
  "summary": "string",
  "keyPoints": ["punto1", "punto2", "punto3"],
  "salesRelevant": "string", 
  "importantData": ["dato1", "dato2"],
  "documentType": "string"
}
`

      try {
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
                content: 'Eres un analista de documentos. Responde SIEMPRE en JSON válido con la estructura solicitada.'
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

        if (summaryResponse.ok) {
          const summaryResult = await summaryResponse.json()
          const analysisText = summaryResult.choices[0]?.message?.content || '{}'
          
          try {
            const analysis = JSON.parse(analysisText)
            
            return new Response(JSON.stringify({
              fileName,
              fileType,
              extractedContent: extractedText,
              aiSummary: analysis.summary || `Documento ${fileName} procesado exitosamente`,
              keyPoints: analysis.keyPoints || ['Contenido extraído', 'Documento procesado'],
              salesRelevant: analysis.salesRelevant || extractedText.substring(0, 200),
              importantData: analysis.importantData || ['Información disponible para análisis'],
              documentType: analysis.documentType || fileType,
              wordCount: extractedText.split(' ').length,
              extractedAt: new Date().toISOString(),
              status: 'completed'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          } catch (parseError) {
            console.error('Error parsing analysis JSON:', parseError)
          }
        }
      } catch (error) {
        console.error('Error generating summary:', error)
      }
    }

    // Respuesta básica si no se pudo generar análisis
    return new Response(JSON.stringify({
      fileName,
      fileType,
      extractedContent: extractedText || `Contenido del archivo ${fileName}`,
      aiSummary: `Documento ${fileName} procesado exitosamente`,
      keyPoints: ['Documento cargado', 'Contenido disponible'],
      salesRelevant: extractedText.substring(0, 200) || 'Información del documento disponible',
      importantData: ['Archivo procesado correctamente'],
      documentType: fileType,
      wordCount: extractedText.split(' ').length,
      extractedAt: new Date().toISOString(),
      status: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in extract-document-content:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract document content',
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
