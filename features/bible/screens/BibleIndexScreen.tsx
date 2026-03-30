import { colors } from "@/constants/theme";
import { useBibleIndexScreenState } from "@/features/bible/hooks/useBibleIndexScreenState";
import type { BibleBookItem, BibleIndexScreenProps } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
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
          <Feather name="book-open" size={22} color={colors.gold} />
        </View>
        <Text style={styles.kicker}>HOLY SCRIPTURES</Text>
        <Text style={styles.headerTitle}>The Bible</Text>
        <Text style={styles.headerSubtitle}>Choose a book to begin reading</Text>
        <View style={styles.tabsRow}>
          <TestamentTab
            label="Old Testament"
            active={activeTestament === "old"}
            onPress={() => onSelectTestament("old")}
          />
          <TestamentTab
            label="New Testament"
            active={activeTestament === "new"}
            onPress={() => onSelectTestament("new")}
          />
        </View>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

function TestamentTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active && styles.tabActive,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

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
  return (
    <View style={[styles.card, index > 0 && styles.cardSpacing]}>
      <View style={styles.cardAccent} />
      <Pressable
        style={({ pressed }) => [styles.cardHeader, pressed && { opacity: 0.92 }]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`Toggle ${book.name}`}
      >
        <Text style={styles.cardTitle}>{book.name}</Text>
        <Feather
          name={expanded ? "chevron-down" : "chevron-right"}
          size={18}
          color={colors.muted}
          style={{ opacity: 0.55 }}
        />
      </Pressable>

      {expanded ? (
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
                  <Pressable
                    key={`${book.id}-${chapter}`}
                    style={[styles.chapterChip, selected && styles.chapterChipSelected]}
                    onPress={() => onSelectChapter(chapter)}
                  >
                    <Text style={[styles.chapterChipText, selected && styles.chapterChipTextSelected]}>
                      {chapter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.inlineError}>{chapterErrorMessage ?? "No chapters found."}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(140,123,106,0.18)",
    backgroundColor: colors.parchment,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  tabsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.25)",
    backgroundColor: colors.white,
    paddingVertical: 9,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "rgba(201,151,58,0.15)",
    borderColor: "rgba(201,151,58,0.55)",
  },
  tabLabel: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.ink,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.14)",
    paddingVertical: 18,
    paddingHorizontal: 16,
    overflow: "hidden",
    shadowColor: "rgba(44,31,14,0.06)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardSpacing: {
    marginTop: 12,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.gold,
  },
  cardTitle: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "serif",
    fontSize: 33/2,
    color: colors.ink,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(140,123,106,0.18)",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
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
    gap: 8,
  },
  chapterChip: {
    minWidth: 38,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(140,123,106,0.3)",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  chapterChipSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(201,151,58,0.14)",
  },
  chapterChipText: {
    fontFamily: "sans-medium",
    fontSize: 13,
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
