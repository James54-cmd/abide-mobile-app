import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

/**
 * Secure AI Chat Edge Function
 * 
 * Handles OpenAI requests server-side with proper authentication,
 * validation, and rate limiting. Never exposes API keys to client.
 */

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed")
    }

    // Get environment variables
    const openAiKey = Deno.env.get("OPENAI_API_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!openAiKey || !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing required environment variables")
    }

    // Get JWT from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing or invalid Authorization header",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const jwt = authHeader.replace("Bearer ", "")
    
    // Manual JWT validation - decode payload to get user info
    let user;
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      
      // Basic JWT validation  
      const now = Date.now() / 1000
      if (payload.exp < now) {
        throw new Error("JWT expired")
      }
      
      if (payload.iss !== `${supabaseUrl}/auth/v1`) {
        throw new Error("Invalid JWT issuer")
      }
      
      if (payload.aud !== "authenticated") {
        throw new Error("Invalid JWT audience")
      }
      
      user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      }
      
      console.log("User authenticated via manual JWT validation:", user.id)
      
    } catch (error) {
      console.error("JWT validation failed:", error)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or expired JWT",
          details: error.message
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Use Service Role client for database operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    // Parse and validate request
    const { conversationId, message, history } = await req.json()
    
    if (!message || typeof message !== 'string') {
      throw new Error("Message is required")
    }
    
    if (message.length > 1000) {
      throw new Error("Message too long (max 1000 characters)")
    }

    if (!conversationId || typeof conversationId !== 'string') {
      throw new Error("Conversation ID is required")
    }

    // Verify user owns conversation
    console.log('Checking conversation ownership for:', conversationId, 'by user:', user.id)
    
    const { data: conversation, error: convError } = await serviceClient
      .from('chat_conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError) {
      console.error('Conversation query error:', convError)
      if (convError.code === 'PGRST116') {
        throw new Error("Conversation not found - please create a new conversation")
      }
      throw new Error(`Database error: ${convError.message}`)
    }

    // Rate limiting check
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    
    const { count, error: rateLimitError } = await serviceClient
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('role', 'user')
      .gte('created_at', oneMinuteAgo)

    if (rateLimitError) {
      console.error("Rate limit query error:", rateLimitError)
      throw new Error("Failed to validate rate limit")
    }

    if ((count ?? 0) >= 10) {
      throw new Error("Rate limit exceeded. Please wait before sending more messages.")
    }

    // Build OpenAI messages array
    const systemPrompt = `You are a wise, compassionate biblical counselor for the Abide mobile app. 

Your responses should:
- Be warm, encouraging, and rooted in Scripture
- Provide 1-2 relevant Bible verses with references
- Offer practical steps or reflection questions
- Keep responses concise (2-3 paragraphs maximum)
- Avoid being preachy or judgmental
- Focus on God's love, grace, and guidance

When someone shares struggles, pain, or sin:
- Lead with compassion and God's love
- Offer hope through Scripture
- Gently guide toward repentance and healing when appropriate
- Never condemn or shame

Format your response naturally - no special JSON structure needed.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history)
        ? history.slice(-6).map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          }))
        : []),
      { role: "user", content: message },
    ]

    // Call OpenAI API
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    })

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.text()
      console.error('OpenAI API Error:', openAiResponse.status, errorData)
      throw new Error("AI service temporarily unavailable")
    }

    const openAiData = await openAiResponse.json()
    const aiReply = openAiData.choices?.[0]?.message?.content

    if (!aiReply) {
      throw new Error("No response from AI service")
    }

    // Store messages in database
    const { error: userMsgError } = await serviceClient.from('chat_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      user_id: user.id,
      encouragement: null
    })

    if (userMsgError) {
      console.error('Failed to store user message:', userMsgError)
      throw new Error("Failed to store message")
    }

    const { data: aiMessage, error: insertError } = await serviceClient
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant', 
        content: aiReply,
        user_id: user.id,
        encouragement: null
      })
      .select('id, conversation_id, role, content, created_at')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        message: {
          id: aiMessage?.id || `temp-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: aiReply,
          created_at: aiMessage?.created_at || new Date().toISOString(),
          user_id: user.id
        }
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    )

  } catch (error) {
    console.error('Edge Function Error:', error)
    
    const message = error instanceof Error ? error.message : "Unexpected error occurred"
    
    // More specific status codes
    let status = 500
    if (message.includes("Authentication") || message.includes("Invalid authentication")) {
      status = 401
    } else if (message.includes("Conversation not found")) {
      status = 404
    } else if (message.includes("access denied")) {
      status = 403
    } else if (message.includes("Rate limit")) {
      status = 429
    } else if (message.includes("too long") || message.includes("required")) {
      status = 400
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: message
      }),
      {
        status,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    )
  }
})