import { colors } from "@/constants/theme";
import type { BibleBookItem } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android (module-scope safe toggle; affects only native animation support).
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const accordionAnimation = LayoutAnimation.create(
  260,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity
);

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
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
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

export interface BibleBookRowProps {
  book: BibleBookItem;
  index: number;
  expanded: boolean;
  selectedChapter: number;
  chapters: number[];
  loading: boolean;
  chapterErrorMessage: string | null;
  onToggle: () => void;
  onSelectChapter: (chapter: number) => void;
}

/** Animated accordion book row (props in → JSX out). */
export function BibleBookRow({
  book,
  index,
  expanded,
  selectedChapter,
  chapters,
  loading,
  chapterErrorMessage,
  onToggle,
  onSelectChapter,
}: BibleBookRowProps) {
  const chevronRotate = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(chevronRotate, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
  }, [expanded, chevronRotate]);

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

const styles = StyleSheet.create({
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
});

