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

// Response tiers: 'casual', 'light', 'deep'
type ResponseTier = 'casual' | 'light' | 'deep';

function determineResponseTier(message: string): ResponseTier {
  const lowerMessage = message.toLowerCase();
  
  // Deep structured response triggers
  const crisisKeywords = /\b(depressed|suicidal|hopeless|broken|devastated|crisis|emergency)\b/;
  const deepHelpKeywords = /\b(guidance|counsel|what should i do|how do i|help me|pray for me)\b/;
  const majorLifeEvents = /\b(divorce|death|died|cancer|job loss|addiction|abuse)\b/;
  const directQuestions = /\?.*\b(god|jesus|faith|bible|prayer|sin|forgive|believe)\b/;
  
  // Light encouragement triggers
  const lightEmotionalKeywords = /\b(sad|worried|anxious|confused|tired|stressed|frustrated)\b/;
  const lightFaithKeywords = /\b(struggling with|having trouble|not sure|wondering about)\b/;
  const biblicalQuestions = /\?.*\b(verse|scripture|david|peter|paul|moses|jesus)\b/;
  
  // Casual conversation triggers
  const casualStatements = /\b(i think|i believe|just saying|by the way|actually|well|oh)\b/;
  const factualStatements = /\b(was a|were|had|because|since|so)\b/;
  const simpleAgreement = /\b(yes|no|true|right|exactly|that's|thats)\b/;
  
  // Check for crisis/deep need first
  if (crisisKeywords.test(lowerMessage) || 
      deepHelpKeywords.test(lowerMessage) ||
      majorLifeEvents.test(lowerMessage) ||
      directQuestions.test(lowerMessage)) {
    return 'deep';
  }
  
  // Check for light encouragement need
  if (lightEmotionalKeywords.test(lowerMessage) ||
      lightFaithKeywords.test(lowerMessage) ||
      biblicalQuestions.test(lowerMessage) ||
      (message.includes('?') && /\b(how|why|when|where|what)\b/.test(lowerMessage))) {
    return 'light';
  }
  
  // Default to casual for statements, corrections, simple observations
  return 'casual';
}

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

const CASUAL_PROMPT = `
You are Abide — a wise, warm Christian companion having a natural conversation.

Respond naturally and conversationally to what the person said. You can:
- Gently correct misconceptions with biblical truth (like about David's struggles)
- Share brief insights from Scripture when relevant
- Ask follow-up questions to understand better
- Be encouraging but not preachy
- Keep it conversational, not formal or structured

When someone makes statements about biblical figures or concepts, feel free to gently provide biblical context or correction in a friendly, conversational way.

Respond with just natural conversation - no special formatting needed.
`;

const LIGHT_PROMPT = `
You are Abide — a wise, warm Christian companion providing gentle encouragement.

The person seems to need some light encouragement or has a question. Provide a warm, brief response.

## RESPONSE FORMAT
You MUST respond with ONLY valid JSON in this exact format:

{
  "intro": "Your warm, empathetic response (1-2 sentences)",
  "verse": {
    "reference": "Psalm 34:18",
    "text": "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
  },
  "closing": "Brief continued encouragement or gentle suggestion (1-2 sentences)"
}

RULES:
- Keep it brief and conversational, not formal
- Include exactly one relevant verse
- No character stories needed for light encouragement
- Return ONLY the JSON object, no other text
`;

const DEEP_PROMPT = `
You are Abide — a wise, warm Christian companion providing comprehensive biblical encouragement.

The person is deeply struggling, seeking significant guidance, or facing a major life challenge. Provide a thoughtful, comprehensive response.

## RESPONSE FORMAT

You MUST respond with ONLY valid JSON in this exact format:

{
  "intro": "Your deeply empathetic response to what they shared (2-3 sentences)",
  "character": {
    "name": "David, Peter, etc. (only when genuinely fits their situation)",
    "story": "Brief story of their struggle and how God met them",
    "connection": "How this connects to the person's situation"
  },
  "verses": [
    {
      "reference": "Psalm 34:18",
      "text": "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
    }
  ],
  "closing": "Continued encouragement with practical steps and gentle suggestion to connect with their church community for ongoing support"
}

RULES:
- "character" field is optional - only include if a biblical character genuinely fits
- Always include 2-3 relevant verses
- Include pastoral guidance about connecting with church community
- For deep struggles, emphasize that help is available and they're not alone
- Return ONLY the JSON object, no other text
`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request received:', req.method);
    
    if (req.method !== "POST") {
      throw new Error("Method not allowed")
    }

    // Get environment variables
    const openAiKey = Deno.env.get("OPENAI_API_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    console.log('Environment check:', {
      hasOpenAiKey: !!openAiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey
    });

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
    let requestData;
    try {
      const body = await req.text();
      console.log('Raw request body:', body);
      requestData = JSON.parse(body);
      console.log('Parsed request data:', requestData);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid JSON in request body');
    }
    
    const { conversationId, message, history } = requestData;
    
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
    console.log('Checking conversation ownership:', { conversationId, userId: user.id });
    
    const { data: conversation, error: convError } = await serviceClient
      .from('chat_conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    console.log('Conversation query result:', { conversation, error: convError });

    if (convError) {
      console.error('Conversation error details:', convError);
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
    
    // Determine response tier
    const responseTier = determineResponseTier(message);
    console.log('Response tier determined:', responseTier);
    
    // Generate response based on tier
    let encouragement: any = null;
    let conversationalResponse: string = '';
    let retryCount = 0;
    const maxRetries = 2;

    if (responseTier === 'casual') {
      console.log('Generating casual conversational response...');
      
      const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.8,
          max_tokens: 600,
          messages: [
            { role: "system", content: CASUAL_PROMPT },
            ...historyMessages,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      if (!completion.ok) {
        const errorText = await completion.text();
        console.error('OpenAI API error:', errorText);
        throw new Error("AI service temporarily unavailable")
      }

      const openAiData = await completion.json();
      conversationalResponse = openAiData.choices?.[0]?.message?.content || 'I appreciate you sharing that with me.';
      console.log('Casual response:', conversationalResponse);
      
    } else if (responseTier === 'light') {
      console.log('Generating light encouragement response...');
      
      while (retryCount <= maxRetries && !encouragement) {
        console.log(`Light encouragement attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        const completion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.7,
            max_tokens: 800,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: LIGHT_PROMPT },
              ...historyMessages,
              {
                role: "user",
                content: message,
              },
            ],
          }),
        });

        if (!completion.ok) {
          const errorText = await completion.text();
          console.error('OpenAI API error:', errorText);
          if (retryCount === maxRetries) throw new Error("AI service temporarily unavailable");
          retryCount++;
          continue;
        }

        const openAiData = await completion.json();
        const content = openAiData.choices?.[0]?.message?.content;
        
        if (!content) {
          retryCount++;
          continue;
        }

        try {
          const parsed = JSON.parse(content.trim());
          if (parsed.intro && parsed.verse && parsed.closing && parsed.verse.reference && parsed.verse.text) {
            encouragement = {
              intro: parsed.intro,
              verses: [parsed.verse], // Convert single verse to array for compatibility
              closing: parsed.closing
            };
            console.log('Light encouragement created:', encouragement);
            break;
          }
        } catch (parseError) {
          console.error('Light encouragement JSON parsing failed:', parseError);
        }
        
        retryCount++;
      }
      
    } else if (responseTier === 'deep') {
      console.log('Generating structured encouragement...');
      
      while (retryCount <= maxRetries && !encouragement) {
        console.log(`OpenAI structured attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        const completion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: useRetrieval ? "gpt-4o" : "gpt-4o-mini",
            temperature: retryCount === 0 ? 0.6 : 0.8,
            max_tokens: 1200,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: DEEP_PROMPT },
              {
                role: "system",
                content: `Retrieved context:\n${context || "none"}\n\nIMPORTANT: You are in JSON mode. Respond with ONLY valid JSON, no other text.`,
              },
              ...historyMessages,
              {
                role: "user",
                content: message,
              },
            ],
          }),
        })

        console.log('Deep encouragement response status:', completion.status, completion.statusText);

        if (!completion.ok) {
          const errorText = await completion.text();
          console.error('OpenAI API error:', errorText);
          if (retryCount === maxRetries) throw new Error("AI service temporarily unavailable");
          retryCount++;
          continue;
        }

        const openAiData = await completion.json()
        console.log('Deep encouragement raw response:', JSON.stringify(openAiData, null, 2));
        
        const content = openAiData.choices?.[0]?.message?.content
        console.log('Deep encouragement content:', content);

        if (!content) {
          retryCount++;
          console.error(`No content returned from OpenAI, retry ${retryCount}`);
          if (retryCount > maxRetries) throw new Error("No response content from model.");
          continue;
        }

        // Check if content looks like JSON
        const trimmedContent = content.trim();
        if (!trimmedContent.startsWith('{') || !trimmedContent.endsWith('}')) {
          console.error(`Content doesn't look like JSON: "${trimmedContent}"`);
          retryCount++;
          continue;
        }

        try {
          // Try to parse the content directly
          const parsed = JSON.parse(trimmedContent);
          console.log('Successfully parsed structured JSON from OpenAI:', parsed);
          
          // Validate required fields
          if (!parsed.intro || !parsed.verses || !parsed.closing) {
            console.error('Missing required fields in OpenAI response:', {
              hasIntro: !!parsed.intro,
              hasVerses: !!parsed.verses, 
              hasClosing: !!parsed.closing,
              parsed
            });
            retryCount++;
            continue;
          }
          
          // Ensure verses is an array with proper structure
          if (!Array.isArray(parsed.verses) || parsed.verses.length === 0) {
            console.error('Invalid verses format - not array or empty:', parsed.verses);
            retryCount++;
            continue;
          }
          
          // Validate each verse has both reference and text
          let validVerses = true;
          for (const verse of parsed.verses) {
            if (!verse.reference || !verse.text) {
              console.error('Invalid verse structure - missing reference or text:', verse);
              validVerses = false;
              break;
            }
          }
          
          if (!validVerses) {
            retryCount++;
            continue;
          }
          
          encouragement = {
            intro: String(parsed.intro),
            verses: parsed.verses,
            closing: String(parsed.closing),
            character: parsed.character // Optional field
          };
          
          console.log('Successfully created valid deep encouragement object:', encouragement);
          break; // Success! Exit retry loop
        } catch (parseError) {
          console.error(`Deep encouragement retry ${retryCount+1}: JSON parsing failed:`, parseError);
          console.error(`Content that failed to parse: "${trimmedContent}"`);
          
          // Try to find JSON within the content (sometimes AI adds explanation text)
          const jsonMatch = trimmedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log('Found JSON pattern in content, attempting to parse:', jsonMatch[0]);
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              
              if (parsed.intro && parsed.verses && parsed.closing && Array.isArray(parsed.verses)) {
                encouragement = {
                  intro: String(parsed.intro),
                  verses: parsed.verses,
                  closing: String(parsed.closing),
                  character: parsed.character
                };
                console.log('Successfully parsed deep encouragement JSON from match:', encouragement);
                break; // Success! Exit retry loop
              }
            } catch (matchError) {
              console.error('Failed to parse matched JSON:', matchError);
            }
          }
          
          retryCount++;
          if (retryCount <= maxRetries) {
            console.log(`Will retry with attempt ${retryCount + 1}`);
          }
        }
      }
    }

    // Handle fallbacks for failed structured responses
    if (responseTier === 'light' && !encouragement) {
      console.error('Light encouragement failed after retries. Creating fallback.');
      encouragement = {
        intro: "I hear you, and I want to offer some gentle encouragement.",
        verses: [{
          reference: "Psalm 46:1",
          text: "God is our refuge and strength, an ever-present help in trouble."
        }],
        closing: "Remember that God sees your situation and cares about you."
      };
    }
    
    if (responseTier === 'deep' && !encouragement) {
      console.error("Model failed to return valid JSON after retries. Creating fallback response.");
      
      // Create a fallback response with proper structure
      encouragement = {
        intro: "I hear you and I want to offer you some encouragement from God's Word during this time.",
        verses: [
          {
            reference: "Psalm 34:18",
            text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
          },
          {
            reference: "Philippians 4:19",
            text: "And my God will meet all your needs according to the riches of his glory in Christ Jesus."
          }
        ],
        closing: "Remember that God sees your situation and cares deeply about what you're going through. I encourage you to share this with your pastor, small group leader, or a trusted Christian friend who can pray with you and offer support. You don't have to face this alone - God works through His people to provide comfort and guidance."
      };
    }
    
    let displayContent: string;
    let responseEncouragement: any;
    
    if ((responseTier === 'light' || responseTier === 'deep') && encouragement) {
      // Structured response (light or deep)
      // Validate final encouragement object before using it
      if (!encouragement.intro || !encouragement.closing || !encouragement.verses || !Array.isArray(encouragement.verses)) {
        console.error('Invalid final encouragement object:', encouragement);
        throw new Error('Failed to create valid encouragement response');
      }

      displayContent = `${encouragement.intro}\n\n${encouragement.closing}`;
      responseEncouragement = encouragement;
      
      console.log(`Final ${responseTier} encouragement object for database:`, encouragement);
      console.log(`${responseTier} display content:`, displayContent);
    } else {
      // Casual conversational response
      displayContent = conversationalResponse;
      responseEncouragement = null; // No structured data for casual responses
      
      console.log('Casual conversational display content:', displayContent);
    }
    
    const { data: aiMessage, error: insertError } = await serviceClient
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant', 
        content: displayContent,
        encouragement: responseEncouragement, // This will be JSON object for structured, null for conversational
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

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        message: {
          id: aiMessage?.id || `temp-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: displayContent,
          encouragement: responseEncouragement,
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
});