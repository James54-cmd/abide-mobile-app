export type Translation = string;

export interface Verse {
  id: string;
  reference: string;
  text: string;
  translation: Translation;
  relevance?: string;
}

export interface EncouragementResponse {
  intro: string;
  verses: Verse[];
  closing: string;
  rebuke: string | null;
  practicalStep: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  response?: EncouragementResponse;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage: string;
}

export interface StreakState {
  streakCount: number;
  streakLastActive: string | null;
  treeStage: number;
  longestStreak: number;
}
