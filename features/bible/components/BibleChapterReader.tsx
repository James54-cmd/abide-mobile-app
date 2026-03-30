import { colors } from "@/constants/theme";
import type { BibleChapterLoadState, BibleVerseLine } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface BibleChapterReaderProps {
  loadState: BibleChapterLoadState;
  verses: BibleVerseLine[];
  errorMessage: string | null;
  onRetry: () => void;
}

/** Dumb reader body — props in, JSX out (SKILL.md Rule 7). */
export function BibleChapterReader({
  loadState,
  verses,
  errorMessage,
  onRetry,
}: BibleChapterReaderProps) {
  if (loadState === "loading") {
    return (
      <View style={styles.centered} accessibilityLabel="Loading chapter">
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.hint}>Opening scripture…</Text>
      </View>
    );
  }

  if (loadState === "error") {
    return (
      <View style={styles.centered}>
        <Feather name="wifi-off" size={36} color={colors.muted} style={styles.errorIcon} />
        <Text style={styles.errorTitle}>We couldn&apos;t load this chapter</Text>
        <Text style={styles.errorBody}>{errorMessage ?? "Check your connection and try again."}</Text>
        <Pressable
          style={styles.retryBtn}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading chapter"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (verses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No verses for this chapter.</Text>
      </View>
    );
  }

  return (
    <>
      {verses.map((line) => (
        <View key={line.verse} style={styles.verseRow}>
          <Text style={styles.verseNum}>{line.verse}</Text>
          <Text style={styles.verseText}>{line.text}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  hint: {
    marginTop: 12,
    fontFamily: "sans",
    fontSize: 14,
    color: colors.muted,
  },
  errorIcon: {
    opacity: 0.55,
    marginBottom: 12,
  },
  errorTitle: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: colors.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  errorBody: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.35)",
  },
  retryLabel: {
    fontFamily: "sans-medium",
    fontSize: 14,
    color: colors.gold,
  },
  empty: {
    fontFamily: "sans",
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
  verseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  verseNum: {
    width: 28,
    fontFamily: "sans-medium",
    fontSize: 11,
    color: colors.gold,
    paddingTop: 4,
  },
  verseText: {
    flex: 1,
    fontFamily: "serif",
    fontSize: 19,
    lineHeight: 30,
    color: colors.ink,
  },
});
