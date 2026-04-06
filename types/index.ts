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

export interface EncouragementResponse {
  intro: string;
  character?: BibleCharacter;
  verses: Verse[];
  closing: string;
  rebuke?: string | null;
  practicalStep?: string;
}

export interface ChatMessage {
  id: string | number;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  encouragement?: EncouragementResponse | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  // Computed/derived fields for UI
  last_message?: string;
  message_count?: number;
  unread_count?: number;
}

export interface StreakState {
  streakCount: number;
  streakLastActive: string | null;
  treeStage: number;
  longestStreak: number;
}
