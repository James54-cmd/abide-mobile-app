import { colors } from "@/constants/theme";
import { useBibleIndexScreenState } from "@/features/bible/hooks/useBibleIndexScreenState";
import type { BibleBookItem, BibleIndexScreenProps } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Smooth accordion animation config ─────────────────────────────────────
const accordionAnimation = LayoutAnimation.create(
  260,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity
);

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
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerIconWrap}>
          <Feather name="book-open" size={20} color={colors.gold} />
        </View>
        <Text style={styles.kicker}>HOLY SCRIPTURES</Text>
        <Text style={styles.headerTitle}>The Bible</Text>
        <Text style={styles.headerSubtitle}>Choose a book to begin reading</Text>

        {/* Shadcn-style sliding tab */}
        <TestamentTabs
          active={activeTestament}
          onSelect={onSelectTestament}
        />
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
          loadState === "loading" ? (
            <View style={styles.stateWrap}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.stateHint}>Loading books…</Text>
            </View>
          ) : loadState === "error" ? (
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
          <BookRow
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

// ─── Shadcn-style sliding tabs ──────────────────────────────────────────────
const TABS = [
  { key: "old", label: "Old Testament" },
  { key: "new", label: "New Testament" },
] as const;

function TestamentTabs({
  active,
  onSelect,
}: {
  active: "old" | "new";
  onSelect: (t: "old" | "new") => void;
}) {
  const [tabWidths, setTabWidths] = useState<Record<string, number>>({});
  const [tabOffsets, setTabOffsets] = useState<Record<string, number>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  const measured = Object.keys(tabWidths).length === TABS.length;

  useEffect(() => {
    if (!measured) return;
    const x = tabOffsets[active] ?? 0;
    const w = tabWidths[active] ?? 0;
    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: x,
        useNativeDriver: false,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
      }),
      Animated.spring(indicatorW, {
        toValue: w,
        useNativeDriver: false,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
      }),
    ]).start();
  }, [active, measured]);

  let cumulativeOffset = 0;

  return (
    <View style={styles.tabsContainer}>
      {/* Sliding background indicator */}
      {measured && (
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              left: indicatorX,
              width: indicatorW,
            },
          ]}
        />
      )}

      {TABS.map((tab, i) => {
        const offset = cumulativeOffset;
        // We'll measure inline; cumulativeOffset updated via onLayout
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            onLayout={(e) => {
              const { width, x } = e.nativeEvent.layout;
              setTabWidths((prev) => ({ ...prev, [tab.key]: width }));
              setTabOffsets((prev) => ({ ...prev, [tab.key]: x }));
            }}
            style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.8 }]}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Animated accordion book row ────────────────────────────────────────────
function BookRow({
  book,
  index,
  expanded,
  selectedChapter,
  chapters,
  loading,
  chapterErrorMessage,
  onToggle,
  onSelectChapter,
}: {
  book: BibleBookItem;
  index: number;
  expanded: boolean;
  selectedChapter: number;
  chapters: number[];
  loading: boolean;
  chapterErrorMessage: string | null;
  onToggle: () => void;
  onSelectChapter: (chapter: number) => void;
}) {
  const chevronRotate = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(chevronRotate, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
  }, [expanded]);

  const handleToggle = () => {
    LayoutAnimation.configureNext(accordionAnimation);
    onToggle();
  };

  const handlePressIn = () => {
    Animated.spring(pressScale, { toValue: 0.985, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
  };

  const chevronDeg = chevronRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        index > 0 && styles.cardSpacing,
        { transform: [{ scale: pressScale }] },
      ]}
    >
      <View style={styles.cardAccent} />

      <Pressable
        style={styles.cardHeader}
        onPress={handleToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Toggle ${book.name}`}
        accessibilityState={{ expanded }}
      >
        <Text style={styles.cardTitle}>{book.name}</Text>

        {/* Chapter count badge when collapsed */}
        {!expanded && chapters.length > 0 && (
          <Text style={styles.chapterCountBadge}>{chapters.length} ch.</Text>
        )}

        <Animated.View style={{ transform: [{ rotate: chevronDeg }], opacity: 0.45 }}>
          <Feather name="chevron-right" size={17} color={colors.muted} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <View style={styles.accordionBody}>
          {loading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={styles.loadingInlineText}>Loading chapters…</Text>
            </View>
          ) : chapters.length > 0 ? (
            <View style={styles.chapterWrap}>
              {chapters.map((chapter) => {
                const selected = selectedChapter === chapter;
                return (
                  <ChapterChip
                    key={`${book.id}-${chapter}`}
                    chapter={chapter}
                    selected={selected}
                    onPress={() => onSelectChapter(chapter)}
                  />
                );
              })}
            </View>
          ) : (
            <Text style={styles.inlineError}>{chapterErrorMessage ?? "No chapters found."}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// ─── Chapter chip with press animation ──────────────────────────────────────
function ChapterChip({
  chapter,
  selected,
  onPress,
}: {
  chapter: number;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, damping: 15, stiffness: 400 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 350 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.chapterChip,
          selected && styles.chapterChipSelected,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.chapterChipText, selected && styles.chapterChipTextSelected]}>
          {chapter}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
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

  // ── Shadcn-style tabs ──
  tabsContainer: {
    flexDirection: "row",
    marginTop: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(140,123,106,0.15)",
    position: "relative",
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    marginRight: 24,
  },
  tabLabel: {
    fontFamily: "sans-medium",
    fontSize: 14,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.ink,
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1.5,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 999,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ── Book card ──
  card: {
    backgroundColor: colors.cream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.13)",
    overflow: "hidden",
    shadowColor: "rgba(44,31,14,0.07)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSpacing: {
    marginTop: 10,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: colors.gold,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 16,
  },
  cardTitle: {
    flex: 1,
    fontFamily: "serif",
    fontSize: 16,
    color: colors.ink,
  },
  chapterCountBadge: {
    fontFamily: "sans",
    fontSize: 11,
    color: colors.muted,
    opacity: 0.65,
    marginRight: 8,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(140,123,106,0.15)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    paddingLeft: 20,
  },
  loadingInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  loadingInlineText: {
    fontFamily: "sans",
    fontSize: 13,
    color: colors.muted,
  },
  chapterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  // ── Chapter chips ──
  chapterChip: {
    minWidth: 44,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(140,123,106,0.25)",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  chapterChipSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(201,151,58,0.13)",
  },
  chapterChipText: {
    fontFamily: "sans-medium",
    fontSize: 14,
    color: colors.muted,
  },
  chapterChipTextSelected: {
    color: colors.ink,
  },
  inlineError: {
    fontFamily: "sans",
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
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