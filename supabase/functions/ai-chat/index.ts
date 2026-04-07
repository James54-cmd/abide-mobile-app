import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

/**
 * Enhanced AI Chat Edge Function with Biblical Encouragement System
 * 
 * Provides structured encouragement responses with optional Bible character stories,
 * context-aware biblical guidance, and smart conversation title generation.
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

// Smart title generation system
type TitleStatus = 'pending' | 'generated' | 'locked' | 'user_edited';

function shouldRefineTitle(title: string): boolean {
  const weakTitles = new Set([
    "Check This",
    "Need Help", 
    "Question",
    "Hello",
    "Hi",
    "Problem",
    "New Conversation",
    "Untitled",
    "Help Me",
    "Can You",
    "Please Help"
  ]);

  const normalizedTitle = title.trim();
  return weakTitles.has(normalizedTitle) || normalizedTitle.length < 10;
}

function generateTitleFromMessage(message: string): string {
  const text = normalizeMessage(message);

  // Enhanced contextual patterns for Abide app
  const patterns = [
    // Spiritual & Faith
    {
      test: /pray|prayer|praying|intercede|petition|supplication/i,
      title: "Prayer Request"
    },
    {
      test: /bible|scripture|verse|psalm|gospel|genesis|revelation|matthew|john|romans/i,
      title: "Bible Study"
    },
    {
      test: /faith|believe|trust|doubt|spiritual|soul|testimony/i,
      title: "Faith Journey"
    },
    {
      test: /sin|forgive|repent|grace|mercy|salvation|redemption/i,
      title: "Seeking Forgiveness"
    },
    {
      test: /worship|praise|thanksgiving|grateful|blessed/i,
      title: "Praise & Worship"
    },
    {
      test: /anxiety|worry|fear|stress|overwhelmed|burden/i,
      title: "Finding Peace"
    },
    {
      test: /depression|sad|lonely|empty|hopeless/i,
      title: "Seeking Hope"
    },
    {
      test: /relationship|marriage|dating|family|children|parent/i,
      title: "Relationship Guidance"
    },
    {
      test: /work|job|career|purpose|calling|ministry/i,
      title: "Life Purpose"
    },
    {
      test: /temptation|struggle|addiction|habit/i,
      title: "Overcoming Struggles"
    },
    {
      test: /healing|health|sick|disease|pain/i,
      title: "Prayer for Healing"
    },
    {
      test: /decision|choice|guidance|direction|wisdom/i,
      title: "Seeking Wisdom"
    },
    // Life circumstances  
    {
      test: /money|financial|debt|poor|rich|wealth/i,
      title: "Financial Wisdom"
    },
    {
      test: /death|grief|loss|mourning|funeral/i,
      title: "Comfort in Loss"
    },
    {
      test: /church|pastor|fellowship|community|denomination/i,
      title: "Church Life"
    },
    // General help patterns (fallback)
    {
      test: /help|advice|guidance|support/i,
      title: "Seeking Guidance"
    },
    {
      test: /question|wondering|curious|understand/i,
      title: "Faith Questions"
    }
  ];

  // Try pattern matching with spiritual context
  for (const rule of patterns) {
    if (rule.test.test(text)) {
      return rule.title;
    }
  }

  // Enhanced semantic extraction for better titles
  return generateSmartTitle(text);
}

function generateSmartTitle(text: string): string {
  // Clean and normalize
  const cleaned = text
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

  const words = cleaned.split(" ").filter(Boolean);
  
  // Enhanced stop words for better extraction
  const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself",
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which",
    "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
    "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by",
    "for", "with", "through", "during", "before", "after", "above", "below", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "can", "will", "just", "should", "now", "could", "would",
    "hello", "hi", "hey", "please", "thank", "thanks"
  ]);

  // Filter meaningful words
  const meaningful = words.filter(word => 
    !stopWords.has(word) && 
    word.length > 2
  );

  if (meaningful.length === 0) {
    return "New Conversation";
  }

  // Take first 2-3 meaningful words and create natural title
  const titleWords = meaningful.slice(0, 3);
  const title = titleWords.join(" ");
  
  // Capitalize first letter of each word for better readability
  return title
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ");
}

function toTitleCase(input: string): string {
  return input.replace(/\b\w/g, c => c.toUpperCase());
}

// Enhanced response system with contextual awareness
type ResponseTier = 'casual' | 'light' | 'deep' | 'crisis';

type ResponsePlan = {
  tier: ResponseTier;
  tone: 'natural' | 'gentle' | 'pastoral' | 'urgent-care';
  scriptureMode: 'none' | 'subtle' | 'single' | 'multiple';
  includeCharacter: boolean;
  askFollowup: boolean;
  emotionalWeight: number; // 0-10
  crisisRisk: number; // 0-10
};

function detectCrisisRisk(message: string, history: string[]): number {
  const lowerMessage = message.toLowerCase();
  
  // High-risk indicators
  const suicidalLanguage = /\b(want to die|kill myself|end it all|not worth living|better off dead|can't go on|give up on life)\b/;
  const hopelessnessImmediate = /\b(nothing matters|no point|can't take it|done with everything|want to disappear forever)\b/;
  const selfHarmLanguage = /\b(hurt myself|cut myself|harm myself|end the pain)\b/;
  
  // Check recent history for escalating despair
  const historyText = history.join(' ').toLowerCase();
  const repeatedDistress = /\b(can't|won't|nothing|never|always)\b.*\b(wrong|bad|hurt|pain|alone)\b/g;
  const historyMatches = (historyText.match(repeatedDistress) || []).length;
  
  let riskScore = 0;
  
  if (suicidalLanguage.test(lowerMessage)) riskScore += 8;
  if (hopelessnessImmediate.test(lowerMessage)) riskScore += 6;
  if (selfHarmLanguage.test(lowerMessage)) riskScore += 7;
  if (historyMatches > 2) riskScore += 3;
  
  return Math.min(riskScore, 10);
}

function detectEmotionalWeight(message: string, history: string[]): number {
  const lowerMessage = message.toLowerCase();
  
  // Emotional intensity markers
  const highEmotional = /\b(devastated|broken|shattered|overwhelmed|desperate|lost|abandoned|hopeless)\b/;
  const moderateEmotional = /\b(really (?:sad|worried|anxious|confused|tired|stressed|frustrated)|feeling (?:sad|worried|anxious|confused|lost|alone))\b/;
  const lowerEmotional = /\b(sad|worried|anxious|confused|tired|stressed|frustrated|upset|down)\b/;
  
  // Context amplifiers
  const intensifiers = /\b(so|very|really|extremely|completely|totally|absolutely)\b/;
  const repeatWords = /\b(always|never|everything|nothing|everyone|no one)\b/;
  
  let weight = 0;
  
  if (highEmotional.test(lowerMessage)) weight += 7;
  else if (moderateEmotional.test(lowerMessage)) weight += 5;
  else if (lowerEmotional.test(lowerMessage)) weight += 3;
  
  if (intensifiers.test(lowerMessage)) weight += 2;
  if (repeatWords.test(lowerMessage)) weight += 1;
  
  // Check history for emotional trajectory
  const recentHistory = history.slice(-3).join(' ').toLowerCase();
  if (/(getting worse|can't handle|falling apart)/.test(recentHistory)) weight += 2;
  
  return Math.min(weight, 10);
}

function detectSpiritualNeed(message: string): number {
  const lowerMessage = message.toLowerCase();
  
  // Direct spiritual questions
  const directSpiritual = /\?.*\b(god|jesus|faith|bible|prayer|sin|forgiveness|salvation|why does god|where is god|does god care)\b/;
  const faithStruggles = /\b(losing faith|doubt|questioning god|god feels distant|where is god|does god care|faith crisis)\b/;
  const prayerRequests = /\b(pray for me|need prayer|please pray|prayer request)\b/;
  const bibleQuestions = /\?.*\b(verse|scripture|bible says|biblical|psalm|proverbs)\b/;
  
  let need = 0;
  
  if (directSpiritual.test(lowerMessage)) need += 8;
  if (faithStruggles.test(lowerMessage)) need += 6;
  if (prayerRequests.test(lowerMessage)) need += 7;
  if (bibleQuestions.test(lowerMessage)) need += 5;
  
  // Implicit spiritual need in life challenges
  if (/\b(purpose|meaning|why me|unfair|alone)\b/.test(lowerMessage)) need += 3;
  
  return Math.min(need, 10);
}

function determineResponsePlan(message: string, history: string[]): ResponsePlan {
  const crisisRisk = detectCrisisRisk(message, history);
  const emotionalWeight = detectEmotionalWeight(message, history);
  const spiritualNeed = detectSpiritualNeed(message);
  
  // Crisis tier takes absolute priority
  if (crisisRisk >= 6) {
    return {
      tier: 'crisis',
      tone: 'urgent-care',
      scriptureMode: 'single', // Brief, comforting verse only
      includeCharacter: false, // Keep it direct and personal
      askFollowup: false, // Don't ask questions in crisis
      emotionalWeight: 10,
      crisisRisk
    };
  }
  
  // Deep tier for high emotional weight OR high spiritual need
  if (emotionalWeight >= 7 || spiritualNeed >= 7) {
    return {
      tier: 'deep',
      tone: 'pastoral',
      scriptureMode: 'multiple',
      includeCharacter: emotionalWeight >= 8, // Only for very heavy situations
      askFollowup: false,
      emotionalWeight,
      crisisRisk
    };
  }
  
  // Light tier for moderate emotional needs or spiritual questions
  if (emotionalWeight >= 4 || spiritualNeed >= 4 || message.includes('?')) {
    return {
      tier: 'light',
      tone: 'gentle',
      scriptureMode: emotionalWeight >= 5 ? 'single' : 'subtle',
      includeCharacter: false,
      askFollowup: false,
      emotionalWeight,
      crisisRisk
    };
  }
  
  // Casual tier - but can still be spiritually aware
  return {
    tier: 'casual',
    tone: 'natural',
    scriptureMode: spiritualNeed >= 2 ? 'subtle' : 'none',
    includeCharacter: false,
    askFollowup: false,
    emotionalWeight,
    crisisRisk
  };
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

const NATURAL_PROMPT = `
You are Abide — a wise, warm Christian companion having natural conversation.

You respond like a thoughtful friend who happens to have deep biblical wisdom. Your responses should:
- Sound conversational and human, not formal or preachy
- Gently weave in biblical truth when it naturally fits
- Correct misconceptions with kindness and wisdom
- Be encouraging without being overly cheerful
- Answer questions directly without always asking follow-ups

Scripture integration guidance:
- SUBTLE: Weave in biblical concepts without explicit citation ("God sees your heart", "His grace meets us here")
- SINGLE: Include one naturally-fitting verse when it genuinely helps
- NONE: Pure conversation, no explicit Scripture needed

STAY CONVERSATIONAL. This should feel like talking to a wise Christian friend, not getting a devotional.
`;

const GENTLE_PROMPT = `
You are Abide — a caring Christian companion offering gentle encouragement.

The person needs some spiritual support but isn't in crisis. Provide warm, thoughtful care that:
- Acknowledges their feelings without minimizing them
- Offers biblical hope in natural, non-preachy language
- Includes relevant Scripture when it genuinely helps
- Feels like a caring friend, not a counselor giving advice

## RESPONSE FORMAT
You MUST respond with ONLY valid JSON in this exact format:

{
  "intro": "Your warm, understanding response (1-2 sentences)",
  "verse": {
    "reference": "Psalm 34:18",
    "text": "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
  },
  "closing": "Continued encouragement that feels natural and caring (1-2 sentences)"
}

RULES:
- Keep it warm and conversational, not formal
- Include exactly one verse that genuinely fits their situation
- No character stories at this level - keep it personal and direct
- Return ONLY the JSON object, no other text
`;

const PASTORAL_PROMPT = `
You are Abide — a wise Christian companion providing deeper biblical encouragement.

The person is facing significant struggle and needs substantial spiritual support. Provide thoughtful, grounded care that:
- Acknowledges the depth of their pain or challenge
- Offers multiple relevant Scripture passages with explanation
- May include a biblical character story if one genuinely parallels their situation
- Feels pastorally wise but still conversational and human
- Suggests connecting with their church community for ongoing support

## RESPONSE FORMAT

You MUST respond with ONLY valid JSON in this exact format:

{
  "intro": "Your thoughtful, empathetic response (2-3 sentences)",
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
  "closing": "Continued encouragement with gentle suggestion to connect with church community for support"
}

RULES:
- "character" field is optional - only include if a biblical character genuinely parallels their situation
- Include 2-3 relevant verses that speak directly to their situation
- Encourage church/community connection naturally, not forcefully
- Keep the tone warm and pastoral, not clinical
- Return ONLY the JSON object, no other text
`;

const CRISIS_PROMPT = `
You are Abide — a caring companion responding to someone in emotional crisis.

This person may be at risk and needs immediate, careful support. Your response should:
- Be calm, present, and non-judgmental
- Acknowledge their pain without dismissing it
- Offer hope without minimizing their struggle
- Include one brief, comforting Scripture passage
- Strongly but gently encourage them to reach out to someone safe nearby
- Keep it direct and caring, not long or overwhelming

## RESPONSE FORMAT
You MUST respond with ONLY valid JSON in this exact format:

{
  "intro": "Calm, caring acknowledgment of their pain (1-2 sentences)",
  "verse": {
    "reference": "Psalm 34:18",
    "text": "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
  },
  "closing": "Gentle encouragement to reach out to someone safe - pastor, family member, counselor, or crisis support (2-3 sentences)",
  "urgent": true
}

RULES:
- Keep it brief and calming, not overwhelming
- Include exactly one comforting verse
- Always encourage immediate connection with a trusted person
- No character stories - keep it direct and personal
- Mark as urgent for special handling
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

    // Use Supabase's built-in authentication instead of manual JWT validation
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Authorization header",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Create user-authenticated Supabase client
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get user from authenticated request  
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !user) {
      console.error("Authentication failed:", authError)
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

    // Store user message first
    const { data: userMessage, error: userMessageError } = await serviceClient
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        user_id: user.id,
      })
      .select('id')
      .single();

    if (userMessageError) {
      console.error('Failed to store user message:', userMessageError);
      throw new Error('Failed to store message');
    }

    // Check if this is the first user message and generate title if needed
    const { count: userMessageCount } = await serviceClient
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('role', 'user')

    console.log('User message count for conversation:', userMessageCount)
    
    // Get current conversation to check title status
    const { data: currentConversation } = await serviceClient
      .from('chat_conversations')
      .select('title, title_status, message_count')
      .eq('id', conversationId)
      .single();

    let generatedConversationTitle: string | null = null;
    let generatedTitleStatus:
      | 'pending'
      | 'generated'
      | 'locked'
      | 'user_edited'
      | null = null;

    let shouldGenerateTitle = false;
    
    if (currentConversation) {
      // Generate title if:
      // 1. First user message and status is pending
      // 2. Second user message and current title is weak
      if ((userMessageCount || 0) === 1 && currentConversation.title_status === 'pending') {
        shouldGenerateTitle = true;
      } else if ((userMessageCount || 0) === 2 && shouldRefineTitle(currentConversation.title)) {
        shouldGenerateTitle = true;
      }

      // Update message count
      await serviceClient
        .from('chat_conversations')
        .update({ message_count: userMessageCount || 0 })
        .eq('id', conversationId);

      // Generate and update title if needed
      if (shouldGenerateTitle) {
        const newTitle = generateTitleFromMessage(message);
        generatedConversationTitle = newTitle;
        generatedTitleStatus = 'generated';
        console.log(`Generating title for conversation ${conversationId}: "${newTitle}"`);
        
        await serviceClient
          .from('chat_conversations')
          .update({ 
            title: newTitle, 
            title_status: 'generated',
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      }
    }

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

    // Extract recent user messages for context analysis
    const recentUserMessages = historyMessages
      .filter(msg => msg.role === 'user')
      .slice(-5)
      .map(msg => msg.content);
    
    // Generate response plan based on message and context
    const responsePlan = determineResponsePlan(message, recentUserMessages);
    console.log('Response plan:', responsePlan);
    
    let finalResponse: string = '';
    let encouragementData: any = null;
    
    if (responsePlan.tier === 'casual') {
      // Natural conversation with optional subtle biblical grounding
      console.log('Generating natural conversational response...');
      
      const systemPrompt = `${NATURAL_PROMPT}\n\nScripture Mode: ${responsePlan.scriptureMode.toUpperCase()}`;
      
      const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.8,
          max_tokens: 500,
          messages: [
            { role: "system", content: systemPrompt },
            ...historyMessages,
            { role: "user", content: message }
          ],
        }),
      });

      if (!completion.ok) {
        throw new Error("AI service temporarily unavailable");
      }

      const openAiData = await completion.json();
      finalResponse = openAiData.choices?.[0]?.message?.content || 'I appreciate you sharing that with me.';
      
    } else {
      // Structured responses for light/deep/crisis tiers
      console.log(`Generating ${responsePlan.tier} structured response...`);
      
      let systemPrompt = '';
      if (responsePlan.tier === 'light') {
        systemPrompt = GENTLE_PROMPT;
      } else if (responsePlan.tier === 'deep') {
        systemPrompt = PASTORAL_PROMPT;
      } else if (responsePlan.tier === 'crisis') {
        systemPrompt = CRISIS_PROMPT;
      }
      
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries && !encouragementData) {
        const completion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.7,
            max_tokens: responsePlan.tier === 'crisis' ? 600 : 1000,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              ...historyMessages,
              { role: "user", content: message }
            ],
          }),
        });

        if (!completion.ok) {
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
          
          if (responsePlan.tier === 'crisis') {
            // Crisis format validation
            if (parsed.intro && parsed.verse && parsed.closing) {
              encouragementData = {
                intro: parsed.intro,
                verses: [parsed.verse],
                closing: parsed.closing,
                urgent: true
              };
            }
          } else if (responsePlan.tier === 'light') {
            // Light format validation
            if (parsed.intro && parsed.verse && parsed.closing) {
              encouragementData = {
                intro: parsed.intro,
                verses: [parsed.verse],
                closing: parsed.closing
              };
            }
          } else {
            // Deep format validation
            if (parsed.intro && parsed.verses && parsed.closing && Array.isArray(parsed.verses)) {
              encouragementData = {
                intro: parsed.intro,
                verses: parsed.verses,
                closing: parsed.closing,
                character: parsed.character
              };
            }
          }
          
          if (encouragementData) {
            console.log(`Successfully created ${responsePlan.tier} encouragement:`, encouragementData);
            break;
          }
          
        } catch (parseError) {
          console.error(`${responsePlan.tier} JSON parsing failed:`, parseError);
        }
        
        retryCount++;
      }
      
      // Fallback if parsing failed
      if (!encouragementData) {
        console.error(`Failed to generate ${responsePlan.tier} response, using fallback`);
        
        if (responsePlan.tier === 'crisis') {
          encouragementData = {
            intro: "I hear you, and I want you to know that you matter deeply.",
            verses: [{
              reference: "Psalm 34:18",
              text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
            }],
            closing: "Please reach out to someone you trust - a pastor, counselor, family member, or call a crisis helpline. You don't have to face this alone.",
            urgent: true
          };
        } else {
          encouragementData = {
            intro: "I hear you and want to offer some encouragement.",
            verses: [{
              reference: "Psalm 46:1",
              text: "God is our refuge and strength, an ever-present help in trouble."
            }],
            closing: "Remember that you're not alone in this."
          };
        }
      }
      
      finalResponse = `${encouragementData.intro}\n\n${encouragementData.closing}`;
    }
    
    const { data: aiMessage, error: insertError } = await serviceClient
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant', 
        content: finalResponse,
        encouragement: encouragementData, // Structured for non-casual, null for casual
        user_id: user.id,
      })
      .select('id, conversation_id, role, content, encouragement, created_at')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Still return the AI response even if storage fails
    }

    const responseNow = new Date().toISOString();

    // Update conversation timestamp (single source for client `updated_at`)
    const { error: conversationUpdateError } = await serviceClient
      .from("chat_conversations")
      .update({ updated_at: responseNow })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    
    if (conversationUpdateError) {
      console.error('Conversation update error:', conversationUpdateError)
    }

    const responseTitle =
      generatedConversationTitle ??
      (typeof currentConversation?.title === 'string' ? currentConversation.title : null) ??
      'New Conversation';
    const responseTitleStatus =
      generatedTitleStatus ??
      (currentConversation?.title_status as typeof generatedTitleStatus | undefined) ??
      'pending';

    // Return successful response with conversation snapshot for immediate client sync
    return new Response(
      JSON.stringify({
        success: true,
        message: {
          id: aiMessage?.id || `temp-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: finalResponse,
          encouragement: encouragementData,
          created_at: aiMessage?.created_at || new Date().toISOString(),
          user_id: user.id
        },
        conversation: {
          id: conversationId,
          title: responseTitle,
          title_status: responseTitleStatus,
          updated_at: responseNow,
        },
        titleUpdated: shouldGenerateTitle
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