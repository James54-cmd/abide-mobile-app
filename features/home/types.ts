import type { Conversation } from "@/types";

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
  /** Shown on passage row (e.g. Genesis 1:26-31) */
  passageReference?: string;
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
  dateLabel: string;
  dailyTopicTitle: string;
  dailySectionLabel: string;
  onFavoritePress?: () => void;
  modules: DevotionalModuleItem[];
  onModulePress?: (id: string, kind: DevotionalModuleKind) => void;
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
