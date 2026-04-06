import { useChatListScreenState } from "@/features/chat/hooks/useChatListScreenState";
import type { ChatListScreenProps } from "@/features/chat/types";
import { ConversationCard } from "@/features/chat/components/ConversationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export function ChatListScreen() {
  return <ChatListScreenView {...useChatListScreenState()} />;
}

export function ChatListScreenView({ 
  conversations, 
  onOpen, 
  onNewConversation,
  onDeleteConversation,
  onRenameConversation
}: ChatListScreenProps) {
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
            icon="heart"
            title="Start your first conversation"
            subtitle="Share what's on your heart and receive biblical encouragement personalized just for you"
          />
        }
        renderItem={({ item, index }) => (
          <ConversationCard 
            conversation={item} 
            onPress={() => onOpen(item.id)} 
            onDelete={() => onDeleteConversation(item.id)}
            onRename={(newTitle) => onRenameConversation(item.id, newTitle)}
            isFirst={index === 0}
          />
        )}
      />

      {/* Floating New Conversation Button */}
      <View className="absolute bottom-6 right-6">
        <Pressable
          className="h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg active:opacity-90"
          onPress={onNewConversation}
          accessibilityRole="button"
          accessibilityLabel="Start new conversation"
        >
          <Feather name="plus" size={24} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
