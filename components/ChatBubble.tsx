import { Text, View } from "react-native";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View className={`mb-3 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[86%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-cream" : "border-l-4 border-gold bg-white"
        }`}
      >
        <Text className="font-sans text-base text-ink">{message.content}</Text>
      </View>
    </View>
  );
}
