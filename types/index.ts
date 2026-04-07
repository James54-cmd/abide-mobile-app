export type Translation = string;

export interface Verse {
  text: string;
  reference: string;
  translation?: string;
  relevance?: string;
}

export interface BibleCharacter {
  name: string;
  story: string;
  connection: string;
}

// Full encouragement format (deep responses)
export interface FullEncouragementResponse {
  intro: string;
  character?: BibleCharacter;
  verses: Verse[];
  closing: string;
  rebuke?: string | null;
  practicalStep?: string;
}

// Light encouragement format (light responses)
export interface LightEncouragementResponse {
  intro: string;
  verses: Verse[]; // Contains exactly one verse for light encouragement
  closing: string;
}

// Union type for all encouragement formats
export type EncouragementResponse = FullEncouragementResponse | LightEncouragementResponse;

export type MessageStatus = "sending" | "sent" | "loading" | "failed";

export interface ChatMessage {
  id: string | number;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  encouragement?: EncouragementResponse | string | null; // Casual=null, Light=LightEncouragementResponse, Deep=FullEncouragementResponse, Legacy=string
  created_at: string;
  // Optimistic update fields for smooth UX
  status?: MessageStatus;
  isPlaceholder?: boolean;
  localId?: string; // Stable client-side ID for optimistic messages
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  title_status: 'pending' | 'generated' | 'locked' | 'user_edited';
  message_count: number;
  created_at: string;
  updated_at: string;
  // Computed/derived fields for UI
  last_message?: string;
  unread_count?: number;
}

export interface StreakState {
  streakCount: number;
  streakLastActive: string | null;
  treeStage: number;
  longestStreak: number;
}
