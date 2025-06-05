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
        console.error('Error decoding plain text:', error)
        extractedText = fileContent
      }
    } else if (fileType === 'application/json') {
      try {
        const decodedContent = atob(fileContent)
        const jsonData = JSON.parse(decodedContent)
        extractedText = JSON.stringify(jsonData, null, 2)
      } catch (error) {
        console.error('Error parsing JSON:', error)
        extractedText = fileContent
      }
    } else if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('excel') || fileType.includes('application/')) {
      // Para PDFs y otros documentos, usar OpenAI GPT-4 Vision para análisis del contenido base64
      console.log('Processing document with OpenAI GPT-4 Vision...')
      
      try {
        // Dividir el contenido en chunks si es muy grande
        const maxChunkSize = 500000; // Tamaño máximo para enviar a la API
        let processedContent = '';
        
        if (fileContent.length > maxChunkSize) {
          console.log('File is large, processing in chunks...');
          
          // Procesar el archivo en múltiples partes
          for (let i = 0; i < Math.ceil(fileContent.length / maxChunkSize); i++) {
            const chunk = fileContent.substring(i * maxChunkSize, (i + 1) * maxChunkSize);
            console.log(`Processing chunk ${i+1} of ${Math.ceil(fileContent.length / maxChunkSize)}`);
            
            const chunkResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: 'Eres un experto en extracción de texto de documentos. Tu trabajo es extraer TODO el contenido textual de manera precisa y completa. Responde SOLO con el texto extraído.'
                  },
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: `Analiza esta parte ${i+1} del documento y extrae TODO el contenido textual visible. Responde SOLO con el texto extraído, sin explicaciones.`
                      },
                      {
                        type: 'image_url',
                        image_url: {
                          url: `data:${fileType};base64,${chunk}`
                        }
                      }
                    ]
                  }
                ],
                max_tokens: 4000,
                temperature: 0.1,
              }),
            });
            
            if (chunkResponse.ok) {
              const chunkResult = await chunkResponse.json();
              const chunkText = chunkResult.choices[0]?.message?.content || '';
              processedContent += chunkText + '\n\n';
            }
          }
          
          extractedText = processedContent;
        } else {
          // Procesar el archivo completo
          const analysisPrompt = `Analiza este documento y extrae TODO el contenido textual visible de manera completa y estructurada.

Archivo: ${fileName}
Tipo: ${fileType}

Instrucciones específicas:
1. Extrae ABSOLUTAMENTE TODO el texto visible en el documento
2. Mantén el orden y estructura original del contenido
3. Si hay tablas, represéntalas claramente con separadores
4. Incluye títulos, subtítulos, párrafos, listas, fechas, números
5. Extrae información de contacto (teléfonos, emails, direcciones)
6. Identifica precios, productos, servicios mencionados
7. Conserva referencias, códigos, números de documento
8. Si encuentras formularios, incluye los campos y valores

El archivo está en formato base64. Analízalo completamente y responde SOLO con el texto extraído, sin explicaciones adicionales.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'Eres un experto en extracción de texto de documentos. Tu trabajo es extraer TODO el contenido textual de manera precisa y completa. Responde SOLO con el texto extraído.'
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
          });

          if (response.ok) {
            const result = await response.json();
            extractedText = result.choices[0]?.message?.content || '';
            
            if (extractedText.length < 20) {
              extractedText = `Documento ${fileName} procesado. Tipo: ${fileType}. El contenido no pudo ser extraído completamente.`;
            }
          } else {
            const errorText = await response.text();
            console.error(`OpenAI API error: ${response.status} - ${errorText}`);
            throw new Error(`OpenAI API error: ${response.status}`);
          }
        }
      } catch (error) {
        console.error('Error processing with GPT-4 Vision:', error);
        
        // Intento alternativo con otro modelo si el primero falla
        try {
          console.log('Trying alternative extraction method...');
          
          const alternativeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Eres un experto en extracción de texto de documentos. Tu trabajo es extraer TODO el contenido textual de manera precisa y completa.'
                },
                {
                  role: 'user',
                  content: `El siguiente contenido es un documento ${fileType} codificado en base64. Por favor, extrae todo el texto visible que puedas encontrar en él. El nombre del archivo es: ${fileName}. Responde SOLO con el texto extraído.`
                }
              ],
              max_tokens: 4000,
              temperature: 0.1,
            }),
          });
          
          if (alternativeResponse.ok) {
            const alternativeResult = await alternativeResponse.json();
            extractedText = alternativeResult.choices[0]?.message?.content || '';
          } else {
            throw new Error('Alternative extraction failed');
          }
        } catch (altError) {
          console.error('Alternative extraction also failed:', altError);
          extractedText = `Error al procesar el documento ${fileName}. Por favor, intente con un formato diferente.`;
        }
      }
    } else {
      extractedText = `Tipo de archivo no soportado: ${fileType}. Por favor, use PDF, Word, Excel, CSV, TXT o JSON.`;
    }

    // Generar resumen y análisis con IA
    if (extractedText.length > 20) {
      console.log('Generating AI summary and analysis...');
      
      const summaryPrompt = `Analiza el siguiente contenido extraído de un documento y genera un análisis estructurado:

Contenido del documento "${fileName}":
${extractedText.substring(0, 8000)}

Responde en formato JSON válido con esta estructura EXACTA:
{
  "summary": "Resumen ejecutivo del contenido en máximo 200 palabras",
  "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3", "punto clave 4", "punto clave 5"],
  "salesRelevant": "Información específica relevante para ventas y negociación", 
  "importantData": ["dato importante 1", "dato importante 2", "dato importante 3"],
  "documentType": "Tipo de documento identificado"
}`;

      try {
        const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'Eres un analista experto en documentos. Responde SIEMPRE en JSON válido con la estructura exacta solicitada.'
              },
              {
                role: 'user',
                content: summaryPrompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.2,
          }),
        });

        if (summaryResponse.ok) {
          const summaryResult = await summaryResponse.json();
          const analysisText = summaryResult.choices[0]?.message?.content || '{}';
          
          try {
            // Limpiar el texto para asegurar JSON válido
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            let analysis;
            
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
            
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
            });
          } catch (parseError) {
            console.error('Error parsing analysis JSON:', parseError);
            throw parseError;
          }
        } else {
          throw new Error('Summary generation failed');
        }
      } catch (error) {
        console.error('Error generating summary:', error);
        // Continuar con respuesta básica
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
    });

  } catch (error) {
    console.error('Error in extract-document-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract document content',
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});