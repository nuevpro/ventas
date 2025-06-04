
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'Sarah', model = 'eleven_multilingual_v2' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Processing TTS request for text:', text.substring(0, 50) + '...');

    // Voice mapping for different character types
    const voiceMapping = {
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',  // Professional female
      'George': 'JBFqnCBsd6RMkjVDRZzb', // Business male
      'Charlotte': 'XB0fDUnXU5powFXDhCwa', // Friendly female
      'Daniel': 'onwK4e9ZLuTAKqWW03F9'  // Authoritative male
    };

    const voiceId = voiceMapping[voice] || voiceMapping['Sarah'];

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 more efficiently
    let binary = '';
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    console.log('TTS generation successful');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
