import { useChatListScreenState } from "@/features/chat/hooks/useChatListScreenState";
import type { ChatListScreenProps } from "@/features/chat/types";
import type { Conversation } from "@/types";
import { BaseListCard } from "@/components/ui/BaseListCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ChatListScreen() {
  return <ChatListScreenView {...useChatListScreenState()} />;
}

export function ChatListScreenView({ conversations, onOpen }: ChatListScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-parchment" edges={["top", "left", "right"]}>
      <ScreenHeader
        icon="message-circle"
        title="Conversations"
        subtitle="Continue where you left off with Abide"
      />

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 28, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="sunrise"
            title="No conversations yet"
            subtitle="Start from Home — tap 'What's on your heart?'"
          />
        }
        renderItem={({ item, index }) => (
          <ConversationCard conversation={item} index={index} onPress={() => onOpen(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

function ConversationCard({
  conversation,
  index,
  onPress,
}: {
  conversation: Conversation;
  index: number;
  onPress: () => void;
}) {
  return (
    <View className={index > 0 ? "mt-3" : ""}>
      <BaseListCard
        title={conversation.title}
        subtitle={conversation.lastMessage}
        onPress={onPress}
        accessibilityLabel={`Open ${conversation.title}`}
        spacing={false}
      />
    </View>
  );
}
