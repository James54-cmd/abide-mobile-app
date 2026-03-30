import { colors } from "@/constants/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { BibleChapterReader } from "@/features/bible/components/BibleChapterReader";
import { BibleReaderSettingsPanel } from "@/features/bible/components/BibleReaderSettingsPanel";
import { useBibleChapterScreenState } from "@/features/bible/hooks/useBibleChapterScreenState";
import type { BibleChapterScreenProps } from "@/features/bible/types";
import { parseChapterParam, parseTransitionDirection } from "@/features/bible/utils/chapterRoute";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export function BibleChapterScreen() {
  const { book, chapter, dir } = useLocalSearchParams<{ book: string; chapter: string; dir?: string }>();
  const ch = parseChapterParam(chapter);
  const transitionDirection = parseTransitionDirection(dir);
  return (
    <BibleChapterScreenView
      {...useBibleChapterScreenState(book ?? "", ch, "BSB")}
      transitionDirection={transitionDirection}
    />
  );
}

export function BibleChapterScreenView({
  bookLabel,
  chapter,
  translation,
  verses,
  loadState,
  errorMessage,
  onRetry,
  onBack,
  canGoPrevChapter,
  canGoNextChapter,
  onGoPrevChapter,
  onGoNextChapter,
  prevChapterLabel,
  nextChapterLabel,
  settingsVisible,
  onOpenSettings,
  onCloseSettings,
  availableTranslations,
  onChangeTranslation,
  settings,
  onChangeSettings,
  headerTitleFontFamily,
  verseTextStyle,
  transitionDirection = "forward",
}: BibleChapterScreenProps & { transitionDirection?: "forward" | "backward" }) {
  // Opposite of swipe direction: left swipe (forward) enters from right.
  const entering = transitionDirection === "forward" ? SlideInRight.duration(220) : SlideInLeft.duration(220);

  return (
    <Animated.View style={styles.safe} entering={entering}>
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
            <Text
              style={[styles.refTitle, { fontFamily: headerTitleFontFamily }]}
              numberOfLines={1}
            >
              {bookLabel} {chapter}
            </Text>
            <View style={styles.translationPill}>
              <Text style={styles.translationText}>{translation}</Text>
            </View>
          </View>
          <Pressable
            style={styles.headerRightBtn}
            onPress={onOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Reader settings"
            hitSlop={12}
          >
            <Feather name="sliders" size={20} color={colors.muted} />
          </Pressable>
        </View>
        <Text style={styles.readerHint}>READER</Text>
      </View>

      <View style={styles.readerWrap}>
        <BibleChapterReader
          loadState={loadState}
          verses={verses}
          errorMessage={errorMessage}
          onRetry={onRetry}
          canGoPrevChapter={canGoPrevChapter}
          canGoNextChapter={canGoNextChapter}
          onGoPrevChapter={onGoPrevChapter}
          onGoNextChapter={onGoNextChapter}
          prevChapterLabel={prevChapterLabel}
          nextChapterLabel={nextChapterLabel}
          verseTextStyle={verseTextStyle}
        />
      </View>

      <BottomDrawer
        visible={settingsVisible}
        onClose={onCloseSettings}
        title="Reader Settings"
      >
        <BibleReaderSettingsPanel
          translation={translation}
          availableTranslations={availableTranslations}
          onChangeTranslation={onChangeTranslation}
          settings={settings}
          onChange={onChangeSettings}
        />
      </BottomDrawer>
      </SafeAreaView>
    </Animated.View>
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
  headerRightBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
  readerWrap: {
    flex: 1,
  },
});
