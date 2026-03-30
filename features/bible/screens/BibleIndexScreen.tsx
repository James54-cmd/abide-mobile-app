import { colors } from "@/constants/theme";
import { PageLoader } from "@/components/ui/PageLoader";
import { useBibleIndexScreenState } from "@/features/bible/hooks/useBibleIndexScreenState";
import type { BibleIndexScreenProps } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import { BibleBookRow as BibleBookRowComponent } from "@/features/bible/components/BibleBookRow";
import { TestamentTabs } from "@/features/bible/components/TestamentTabs";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function BibleIndexScreen() {
  return <BibleIndexScreenView {...useBibleIndexScreenState()} />;
}

export function BibleIndexScreenView({
  books,
  activeTestament,
  expandedBookId,
  selectedChapterByBook,
  chaptersByBook,
  loadingBookId,
  loadingAllChapters,
  loadState,
  errorMessage,
  chapterErrorMessage,
  onSelectTestament,
  onToggleBook,
  onSelectChapter,
  onRetry,
}: BibleIndexScreenProps) {
  const [minLoaderElapsed, setMinLoaderElapsed] = useState(false);
  const isInitialLoading = loadState === "loading" && books.length === 0;
  const showInitialLoader = isInitialLoading || !minLoaderElapsed;

  useEffect(() => {
    const timer = setTimeout(() => setMinLoaderElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showInitialLoader) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.pageLoaderWrap}>
          <PageLoader />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerIconWrap}>
          <Feather name="book-open" size={20} color={colors.gold} />
        </View>
        <Text style={styles.kicker}>HOLY SCRIPTURES</Text>
        <Text style={styles.headerTitle}>The Bible</Text>
        <Text style={styles.headerSubtitle}>Choose a book to begin reading</Text>

        <View style={styles.testamentTabsWrap}>
          <TestamentTabs activeTestament={activeTestament} onSelectTestament={onSelectTestament} />
        </View>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          loadingAllChapters ? (
            <View style={styles.preloadBanner}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={styles.preloadText}>Preparing chapter lists…</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loadState === "error" ? (
            <View style={styles.stateWrap}>
              <Feather name="wifi-off" size={34} color={colors.muted} style={{ opacity: 0.6 }} />
              <Text style={styles.stateTitle}>Couldn&apos;t load books</Text>
              <Text style={styles.stateHint}>{errorMessage ?? "Please try again."}</Text>
              <Pressable style={styles.retryBtn} onPress={onRetry}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.stateWrap}>
              <Text style={styles.stateHint}>No books available.</Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <BibleBookRowComponent
            book={item}
            index={index}
            expanded={expandedBookId === item.id}
            selectedChapter={selectedChapterByBook[item.id] ?? 1}
            chapters={chaptersByBook[item.id] ?? []}
            loading={loadingBookId === item.id}
            chapterErrorMessage={chapterErrorMessage}
            onToggle={() => onToggleBook(item.id)}
            onSelectChapter={(chapter) => onSelectChapter(item.id, chapter)}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  pageLoaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(140,123,106,0.18)",
    backgroundColor: colors.parchment,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(201,151,58,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  kicker: {
    fontFamily: "sans",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: "serif",
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  testamentTabsWrap: {
    marginTop: 14,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ── States ──
  preloadBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 10,
  },
  preloadText: {
    fontFamily: "sans",
    fontSize: 13,
    color: colors.muted,
  },
  stateWrap: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stateTitle: {
    marginTop: 10,
    fontFamily: "sans-medium",
    fontSize: 18,
    color: colors.ink,
  },
  stateHint: {
    marginTop: 8,
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.35)",
  },
  retryText: {
    fontFamily: "sans-medium",
    fontSize: 14,
    color: colors.gold,
  },
});