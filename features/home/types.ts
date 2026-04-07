import type { Conversation } from "@/types";
import type { ImageSourcePropType } from "react-native";

export type DevotionalModuleKind = "quote" | "passage" | "devotional" | "prayer";

export interface WeekDayItem {
  /** Stable key for list rendering */
  id: string;
  label: string;
  /** Shown as filled circle (e.g. completed or “today”) */
  highlighted: boolean;
}

export interface DevotionalModuleItem {
  id: string;
  kind: DevotionalModuleKind;
  /** Row title: Quote, Passage, etc. */
  title: string;
  durationMinutes?: number;
  completed?: boolean;
  summary?: string;
  body?: string;
  actionLabel?: string;
  /** Shown on passage row (e.g. Genesis 1:26-31) */
  passageReference?: string;
}

export interface DailyDevotionEntry {
  id: string;
  theme: string;
  image: ImageSourcePropType;
  quote: {
    text: string;
    author: string;
    sourceLabel: string;
  };
  passage: {
    reference: string;
    summary: string;
  };
  devotional: {
    title: string;
    body: string;
  };
  prayer: {
    title: string;
    body: string;
  };
}

export interface DailyDevotionProgress {
  dateKey: string;
  quoteCompleted: boolean;
  completedModuleIds: string[];
  isFavorite: boolean;
}

/**
 * Presentational props for the Today / home devotional screen.
 * Data and navigation callbacks are supplied by `useHomeScreenState` (or tests).
 */
export interface HomeScreenProps {
  userInitial: string;
  headerTitle: string;
  streakCount: number;
  weekDays: WeekDayItem[];
  calendarLinkLabel: string;
  onCalendarPress?: () => void;
  onCommunityPress?: () => void;
  quoteImage: ImageSourcePropType;
  quoteText: string;
  quoteAuthor: string;
  quoteSourceLabel: string;
  quoteTheme: string;
  quoteCompleted: boolean;
  onQuoteCompletePress?: () => void;
  dateLabel: string;
  dailyTopicTitle: string;
  dailySectionLabel: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  modules: DevotionalModuleItem[];
  onModulePress?: (id: string, kind: DevotionalModuleKind) => void;
  onToggleModuleComplete?: (id: string) => void;
  onPassageListen?: (moduleId: string) => void;
  onPassageRead?: (moduleId: string) => void;
  /** Primary CTA (e.g. chat / journal) */
  onPrimaryPromptPress?: () => void;
  primaryPromptTitle: string;
  primaryPromptSubtitle: string;
  conversations: Conversation[];
  onConversationPress?: (id: string) => void;
  onSettingsPress?: () => void;
}
