import { colors } from "@/constants/theme";
import { useBibleIndexScreenState } from "@/features/bible/hooks/useBibleIndexScreenState";
import type { BibleBookItem, BibleIndexScreenProps } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function BibleIndexScreen() {
  return <BibleIndexScreenView {...useBibleIndexScreenState()} />;
}

export function BibleIndexScreenView({ books, onOpen }: BibleIndexScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerIconWrap}>
          <Feather name="book-open" size={22} color={colors.gold} />
        </View>
        <Text style={styles.kicker}>HOLY SCRIPTURES</Text>
        <Text style={styles.headerTitle}>The Bible</Text>
        <Text style={styles.headerSubtitle}>Choose a book to begin reading</Text>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <BookRow book={item} index={index} onPress={() => onOpen(item.id, 1)} />
        )}
      />
    </SafeAreaView>
  );
}

function BookRow({
  book,
  index,
  onPress,
}: {
  book: BibleBookItem;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, index > 0 && styles.cardSpacing, pressed && { opacity: 0.92 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${book.name}`}
    >
      <View style={styles.cardAccent} />
      <Text style={styles.cardTitle}>{book.name}</Text>
      <Feather name="chevron-right" size={18} color={colors.muted} style={{ opacity: 0.45 }} />
    </Pressable>
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
    fontFamily: "sans-medium",
    fontSize: 17,
    color: colors.ink,
  },
});
