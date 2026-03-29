import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatBubble } from "@/components/ChatBubble";
import { PracticalStepChip } from "@/components/PracticalStepChip";
import { RebukeBlock } from "@/components/RebukeBlock";
import { VerseCard } from "@/components/VerseCard";
import { triggerSend } from "@/lib/native/haptics";
import type { ChatMessage } from "@/types";

interface Props {
  conversationId: string;
  messages: ChatMessage[];
}

export function ChatThreadScreen({ conversationId, messages }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-parchment">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <Text className="px-4 pb-2 pt-3 font-serif text-2xl text-ink">{`Conversation ${conversationId}`}</Text>
        <FlatList
          className="px-4"
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <ChatBubble message={item} />
              {item.response ? (
                <View className="mb-3 gap-2">
                  {item.response.verses.map((verse) => (
                    <VerseCard key={verse.id} verse={verse} />
                  ))}
                  <RebukeBlock text={item.response.rebuke ?? ""} />
                  <PracticalStepChip text={item.response.practicalStep} />
                </View>
              ) : null}
            </View>
          )}
        />
        <View className="flex-row items-center gap-2 border-t border-gold/30 bg-cream p-3">
          <TextInput
            placeholder="Abide is listening..."
            placeholderTextColor="#8C7B6A"
            className="flex-1 rounded-xl bg-white px-3 py-3 font-sans text-ink"
          />
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-gold active:scale-95"
            onPress={() => {
              void triggerSend();
            }}
          >
            <Text className="font-sans-medium text-white">➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
