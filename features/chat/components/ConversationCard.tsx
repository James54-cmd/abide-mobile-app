import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Conversation } from "@/types";
import { formatConversationTime, formatMessageCount } from "@/features/chat/utils/formatting";

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  isFirst?: boolean;
}

export function ConversationCard({
  conversation,
  onPress,
  isFirst = false,
}: ConversationCardProps) {
  const hasUnread = (conversation.unread_count ?? 0) > 0;

  return (
    <Pressable
      className={`flex-row items-stretch overflow-hidden rounded-2xl border bg-cream active:opacity-90 ${
        hasUnread ? "border-gold/25" : "border-gold/10"
      } ${isFirst ? "" : "mt-3"}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation: ${conversation.title}`}
    >
      {/* Accent bar — dimmed when read */}
      <View className={`w-[3px] ${hasUnread ? "bg-gold" : "bg-gold/30"}`} />

      {/* Content */}
      <View className="flex-1 px-4 py-3.5">
        {/* Title + timestamp */}
        <View className="mb-1 flex-row items-start justify-between">
          <Text
            className="flex-1 font-sans-medium text-[14.5px] leading-snug text-ink"
            numberOfLines={1}
          >
            {conversation.title}
          </Text>
          <Text className="ml-3 shrink-0 font-sans text-[11px] text-muted">
            {formatConversationTime(
              conversation.updated_at || conversation.created_at
            )}
          </Text>
        </View>

        {/* Preview */}
        <Text
          className="font-sans text-[13px] leading-[1.55] text-muted"
          numberOfLines={2}
        >
          {conversation.last_message}
        </Text>

        {/* Footer */}
        <View className="mt-2.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Feather
              name="message-circle"
              size={12}
              color="#9E8C7A"
              style={{ opacity: 0.55 }}
            />
            <Text className="font-sans text-[11px] text-muted">
              {formatMessageCount(conversation.message_count ?? 1)}
            </Text>
          </View>

          {hasUnread && (
            <View className="min-w-[20px] items-center justify-center rounded-full bg-gold px-1.5 py-0.5">
              <Text className="font-sans-medium text-[11px] text-white">
                {(conversation.unread_count ?? 0) > 99
                  ? "99+"
                  : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <View className="items-center justify-center pr-4">
        <Feather
          name="chevron-right"
          size={14}
          color="#9E8C7A"
          style={{ opacity: 0.35 }}
        />
      </View>
    </Pressable>
  );
}