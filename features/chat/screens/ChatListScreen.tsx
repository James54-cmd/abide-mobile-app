import { FlatList, Pressable, Text, View } from "react-native";
import type { Conversation } from "@/types";

interface Props {
  conversations: Conversation[];
  onOpen: (id: string) => void;
}

export function ChatListScreen({ conversations, onOpen }: Props) {
  return (
    <View className="flex-1 bg-parchment px-4 pt-4">
      <Text className="mb-3 font-serif text-3xl text-ink">Conversations</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable className="mb-2 rounded-xl bg-cream p-4 active:scale-95" onPress={() => onOpen(item.id)}>
            <Text className="font-sans-medium text-ink">{item.title}</Text>
            <Text className="mt-1 font-sans text-sm text-muted">{item.lastMessage}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
