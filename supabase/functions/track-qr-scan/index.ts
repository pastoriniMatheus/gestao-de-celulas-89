
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, id } = await req.json()
    const userIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log(`Tracking ${type} scan for ID: ${id}`)

    if (type === 'qr') {
      // Incrementar contador de QR codes
      const { error } = await supabaseClient.rpc('increment_qr_scan_count', {
        qr_id: id,
        user_ip: userIP,
        user_agent_string: userAgent
      })

      if (error) {
        console.error('Erro ao incrementar scan QR:', error)
        throw error
      }
    } else if (type === 'event') {
      // Incrementar contador de eventos
      const { error } = await supabaseClient
        .from('events')
        .update({ 
          scan_count: supabaseClient.raw('scan_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Erro ao incrementar scan evento:', error)
        throw error
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Erro no track-qr-scan:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
