import { colors } from "@/constants/theme";
import { useChatListScreenState } from "@/features/chat/hooks/useChatListScreenState";
import type { ChatListScreenProps } from "@/features/chat/types";
import type { Conversation } from "@/types";
import { Feather } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ChatListScreen() {
  return <ChatListScreenView {...useChatListScreenState()} />;
}

export function ChatListScreenView({ conversations, onOpen }: ChatListScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerIconWrap}>
          <Feather name="message-circle" size={22} color={colors.gold} />
        </View>
        <Text style={styles.headerTitle}>Conversations</Text>
        <Text style={styles.headerSubtitle}>Continue where you left off with Abide</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="sunrise" size={40} color={colors.muted} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>Start from Home — tap &quot;What&apos;s on your heart?&quot;</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <ConversationRow conversation={item} index={index} onPress={() => onOpen(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

function ConversationRow({
  conversation,
  index,
  onPress,
}: {
  conversation: Conversation;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, index > 0 && styles.cardSpacing, pressed && { opacity: 0.92 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${conversation.title}`}
    >
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{conversation.title}</Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {conversation.lastMessage}
        </Text>
      </View>
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
    marginBottom: 12,
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
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.14)",
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
    width: 4,
    alignSelf: "stretch",
    backgroundColor: colors.gold,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  cardTitle: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  cardPreview: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: "sans-medium",
    fontSize: 17,
    color: colors.ink,
    marginTop: 16,
  },
  emptySub: {
    fontFamily: "sans",
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
