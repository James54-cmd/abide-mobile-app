import { colors } from "@/constants/theme";
import { useBibleChapterScreenState } from "@/features/bible/hooks/useBibleChapterScreenState";
import type { BibleChapterScreenProps } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function BibleChapterScreen() {
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
  const ch = Number(chapter || "1") || 1;
  return (
    <BibleChapterScreenView
      {...useBibleChapterScreenState(book ?? "", ch, "NIV")}
    />
  );
}

export function BibleChapterScreenView({
  bookLabel,
  chapter,
  translation,
  verses,
  onBack,
}: BibleChapterScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backBtn}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
          >
            <Feather name="chevron-left" size={24} color={colors.muted} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={styles.refTitle} numberOfLines={1}>
              {bookLabel} {chapter}
            </Text>
            <View style={styles.translationPill}>
              <Text style={styles.translationText}>{translation}</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>
        <Text style={styles.readerHint}>READER</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.readerSheet}>
          {verses.map((line) => (
            <View key={line.verse} style={styles.verseRow}>
              <Text style={styles.verseNum}>{line.verse}</Text>
              <Text style={styles.verseText}>
                {line.text}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(140,123,106,0.18)",
    backgroundColor: colors.parchment,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitles: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 44,
  },
  refTitle: {
    fontFamily: "serif",
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
    textAlign: "center",
  },
  translationPill: {
    marginTop: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.25)",
  },
  translationText: {
    fontFamily: "sans-medium",
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  readerHint: {
    fontFamily: "sans",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  readerSheet: {
    backgroundColor: colors.cream,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.12)",
    shadowColor: "rgba(44,31,14,0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 3,
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
