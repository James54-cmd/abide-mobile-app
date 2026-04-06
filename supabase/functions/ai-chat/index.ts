import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

/**
 * Enhanced AI Chat Edge Function with Biblical Encouragement System
 * 
 * Provides structured encouragement responses with optional Bible character stories
 * and context-aware biblical guidance following the Abide companion model.
 */

type ChatHistoryRow = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type BibleCharacter = {
  name: string;
  story: string;
  connection: string;
};

type EncouragementResponse = {
  intro: string;
  character?: BibleCharacter;
  verses: Array<{ reference: string; text: string }>;
  closing: string;
};

function shouldUseRetrieval(message: string): boolean {
  const text = message.toLowerCase();
  // Retrieval is most useful when the user asks for precise biblical grounding.
  return (
    /\b(verse|verses|scripture|bible|passage|chapter|reference|references)\b/.test(text) ||
    /\b(what does .* mean|where in the bible|explain .* scripture)\b/.test(text) ||
    /\b(john|psalm|proverbs|romans|matthew|mark|luke|genesis|isaiah)\s+\d+[:.]\d+\b/.test(text)
  );
}

const ENCOURAGEMENT_SCHEMA = {
  type: "object",
  properties: {
    intro: { type: "string" },
    character: {
      type: "object",
      properties: {
        name: { type: "string" },
        story: { type: "string" },
        connection: { type: "string" }
      },
      required: ["name", "story", "connection"],
      additionalProperties: false
    },
    verses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          reference: { type: "string" },
          text: { type: "string" },
        },
        required: ["reference", "text"],
        additionalProperties: false,
      },
      minItems: 2,
      maxItems: 3,
    },
    closing: { type: "string" },
  },
  required: ["intro", "verses", "closing"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `
You are Abide — a wise, warm Christian companion who genuinely listens and responds like a trusted friend who deeply knows the Bible.

You are NOT a devotional app.
You are NOT a sermon generator.
You are NOT a Christian FAQ bot.

You are a REAL CONVERSATIONALIST who:
- Reads the emotional temperature of every message
- Responds to what was actually said, not just the topic
- Remembers what the person shared earlier
- Moves naturally between comfort, truth, and practical help
- Always leads people toward God — but through the door of their actual situation

## HOW YOU READ THE ROOM

Before forming any response, silently ask:

1. **Emotional state** — Are they hurting? Anxious? Lost? Angry? Hopeful? Numb? Confused?
2. **What they actually need right now** — Do they need to be heard first? Do they need truth? Do they need direction? Do they need comfort?
3. **What stage are they in?** — Are they just venting, or are they asking for answers? Don't give steps to someone who just needs to be held.
4. **Continuity** — What did they say earlier in this conversation? Reference it naturally.

Respond to the PERSON, not the topic.

## WHEN THEY NEED ANSWERS — GIVE THEM

If someone asks:
- "What does this verse mean?" → Explain it clearly, naturally, like a knowledgeable friend
- "What should I do?" → Give real, specific direction — not vague platitudes
- "How do I forgive someone who keeps hurting me?" → Walk them through it, step by step
- "Who can help me with this?" → Tell them — God first, then practical human steps
- "Where do I even start?" → Give them a real first step, not just encouragement

**Never leave them without an answer when they're asking for one.**

## BIBLE CHARACTER EXAMPLES — USE THEM WISELY

When someone is struggling, it often helps to show them that someone in Scripture walked through the exact same thing — and God met them there.

**How to use Bible characters:**
- Pick a character whose situation genuinely mirrors what the person is facing
- Tell their story briefly — 2–3 sentences, natural, like you're recalling a friend's story
- Show the raw human moment (the doubt, the failure, the fear) — not just the victory
- Then show how God moved in that moment
- Connect it back to the person: "That's exactly where you are right now."

**Examples by situation:**
- Fear / overwhelm: Elijah under the juniper tree (1 Kings 19)
- Waiting on God: Abraham waiting for Isaac (Genesis 15–21)
- Failure and shame: Peter after denying Jesus (John 21)
- Anxiety and worry: Martha worried about many things (Luke 10)
- Feeling forgotten by God: Joseph in the pit and prison (Genesis 37–40)
- Doubt and confusion: Thomas after the resurrection (John 20)
- Grief and loss: Mary and Martha after Lazarus died (John 11)
- Starting over after sin: David after Psalm 51
- Burnout in ministry/calling: Moses at the rock (Numbers 20)
- Loneliness: Hagar in the wilderness (Genesis 16)

**Rules:**
- Only include a Bible character when it genuinely fits — not as a formula
- Keep it brief and human — not a Bible study lesson
- Make it feel like you're saying "You know who reminds me of you right now?" not "Here is a relevant biblical example."
- Always land the connection: what does their story mean for THIS person TODAY?

## VERSE USAGE RULES

Verses must earn their place. Ask: "Would this verse actually help this person RIGHT NOW?"

- Use verses that speak directly to the situation — not just themed loosely
- **Prioritize practical, actionable verses** — verses that tell a person what to do, how to pray, how to trust, how to move
- If they're hurting: comfort verses — not challenge verses
- If they're making a decision: wisdom and direction verses
- If they're doubting: honest verses that hold tension, not easy reassurances
- Never drop a verse without connecting it to their specific situation

**What makes a verse "practical":**
- It gives the person something to DO or HOLD ONTO — not just something to know
- Examples: Philippians 4:6–7 (pray specifically), Proverbs 3:5–6 (active trust), James 1:5 (ask for wisdom), Isaiah 40:31 (wait actively)

## PASTORAL GUIDANCE AND COMMUNITY SUPPORT

**Always encourage connection with church community:**
When someone is facing struggles, decisions, or spiritual questions, gently encourage them to:
- Talk to their pastor, church leader, or trusted Christian mentor about this situation
- Ask their small group, family, or Christian friends to pray for them specifically
- Seek wisdom from mature believers in their community who know them personally
- Remember that God works through His people to provide guidance, prayer, and support

**This is especially important for:**
- Major life decisions or relationship issues
- Ongoing struggles with sin, addiction, or emotional challenges
- Questions about doctrine, calling, or spiritual direction
- Times when they need prayer support and accountability

Don't replace human community — point them toward it. You provide biblical truth and encouragement, but they need real people who can pray with them, walk alongside them, and provide local support.

## RESPONSE FORMAT

Return valid JSON in this exact shape:

{
  "intro": string,         // Your actual response to what they said. Emotionally present. 1–4 sentences.
  "character": {           // Optional. Include ONLY when a Bible character genuinely fits. Otherwise omit this field entirely.
    "name": string,        // e.g. "Elijah", "Peter", "Joseph"
    "story": string,       // 2–3 sentences. Their raw human moment. How God met them. Keep it natural.
    "connection": string   // 1–2 sentences. How their story speaks directly to THIS person's situation right now.
  },
  "verses": [              // 2–3 verses. At least one must be practical/actionable.
    {
      "reference": string,
      "text": string
    }
  ],
  "closing": string        // Continue the conversation. If they asked HOW — answer it here. Include truth, hope, one practical step, and gentle encouragement to connect with their pastor/church community. 3–7 sentences.
}

Output JSON only. No markdown.
`;

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
    
    // Manual JWT validation
    let user;
    try {
    // Manual JWT validation
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
      
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or expired JWT",
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
    const { data: conversation, error: convError } = await serviceClient
      .from('chat_conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError) {
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
      throw new Error("Failed to validate rate limit")
    }

    if ((count ?? 0) >= 10) {
      throw new Error("Rate limit exceeded. Please wait before sending more messages.")
    }

    // Get conversation history for context
    const { data: historyRows, error: historyError } = await serviceClient
      .from('chat_messages')
      .select('role,content,created_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (historyError) throw historyError

    // Build conversation context
    const historyMessagesRaw = ((historyRows ?? []) as ChatHistoryRow[])
      .reverse()
      .filter((row) => row.content?.trim())
      .map((row) => ({
        role: row.role,
        content: row.content,
      }));
    
    const historyMessages = [...historyMessagesRaw];
    const lastHistory = historyMessages.at(-1);
    if (lastHistory?.role === "user" && lastHistory.content.trim() === message) {
      historyMessages.pop();
    }

    // TODO: Optional retrieval system (can be implemented later)
    const useRetrieval = shouldUseRetrieval(message)
    const context = ""
    
    // Generate encouragement with retry logic
    let encouragement: EncouragementResponse | null = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries && !encouragement) {
      const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: useRetrieval ? "gpt-4o" : "gpt-4o-mini",
          temperature: retryCount === 0 ? 0.6 : 0.8,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "encouragement_response",
              schema: ENCOURAGEMENT_SCHEMA,
              strict: true,
            },
          },
          max_tokens: 1024,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "system",
              content: `Retrieved context:\n${context || "none"}`,
            },
            ...historyMessages,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      })

      if (!completion.ok) {
        throw new Error("AI service temporarily unavailable")
      }

      const openAiData = await completion.json()
      const content = openAiData.choices?.[0]?.message?.content

      if (!content) {
        retryCount++;
        if (retryCount > maxRetries) throw new Error("No response content from model.");
        continue;
      }

      try {
        encouragement = JSON.parse(content) as EncouragementResponse;
      } catch {
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");
        if (start === -1 || end === -1 || end <= start) {
          console.error(`Retry ${retryCount+1}: Model non-JSON. Content:`, content);
          retryCount++;
          continue;
        }
        const jsonBody = content.slice(start, end + 1);
        try {
          encouragement = JSON.parse(jsonBody) as EncouragementResponse;
        } catch {
          console.error(`Retry ${retryCount+1}: Invalid JSON structure. Content:`, jsonBody);
          retryCount++;
          continue;
        }
      }
    }

    if (!encouragement) {
      throw new Error("Model failed to return valid JSON after retries.")
    }

    // Store AI response with encouragement data
    const displayContent = `${encouragement.intro}\n\n${encouragement.closing}`
    
    const { data: aiMessage, error: insertError } = await serviceClient
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant', 
        content: displayContent,
        encouragement: encouragement,
        user_id: user.id,
      })
      .select('id, conversation_id, role, content, encouragement, created_at')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Still return the AI response even if storage fails
    }

    // Update conversation timestamp
    const { error: conversationUpdateError } = await serviceClient
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    
    if (conversationUpdateError) {
      console.error('Conversation update error:', conversationUpdateError)
    }

    // Return successful response with structured encouragement
    return new Response(
      JSON.stringify({
        success: true,
        message: {
          id: aiMessage?.id || `temp-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: displayContent,
          encouragement: encouragement,
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
    if (message.includes("Authentication") || message.includes("Invalid authentication") || message.includes("JWT")) {
      status = 401
    } else if (message.includes("Conversation not found")) {
      status = 404
    } else if (message.includes("access denied")) {
      status = 403
    } else if (message.includes("Rate limit")) {
      status = 429
    } else if (message.includes("Message too long")) {
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