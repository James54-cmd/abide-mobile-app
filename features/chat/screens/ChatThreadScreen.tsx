import { ChatBubble } from "@/features/chat/components/ChatBubble";
import { PracticalStepChip } from "@/features/chat/components/PracticalStepChip";
import { RebukeBlock } from "@/features/chat/components/RebukeBlock";
import { useChatThreadScreenState } from "@/features/chat/hooks/useChatThreadScreenState";
import type { ChatMessage } from "@/types";
import { Feather } from "@expo/vector-icons";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";

interface Props {
  conversationId: string;
}

/**
 * ChatThreadScreen - displays messages in a conversation with input bar
 * Follows SKILL.md Rule 8: Screen composes only (state hook + components)
 */
export function ChatThreadScreen({ conversationId }: Props) {
  // Rule 9: State lives in one hook per feature
  const state = useChatThreadScreenState(conversationId);

  const renderMessage: ListRenderItem<ChatMessage> = ({ item: message }) => {
    const isUser = message.role === "user";
    
    return (
      <View className="px-4 py-1">
        <ChatBubble message={message} />
        
        {/* Assistant message enhancements */}
        {!isUser && message.encouragement && (
          <View className="ml-1 mt-3 max-w-[82%]">
            {message.encouragement.practicalStep && (
              <PracticalStepChip text={message.encouragement.practicalStep} />
            )}
            
            {message.encouragement.rebuke && (
              <RebukeBlock text={message.encouragement.rebuke} />
            )}
          </View>
        )}
      </View>
    );
  };

  // Rule 12: SafeAreaView and KeyboardAvoidingView at screen level only
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-parchment">
      {/* Header - outside KAV so keyboard never moves it */}
      <View className="flex-row items-center border-b border-muted/20 bg-cream px-4 py-3.5">
        <Pressable
          onPress={state.onBack}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(201, 151, 58, 0.1)" }}
        >
          <Feather name="arrow-left" size={18} color="#C9973A" />
        </Pressable>

        {/* Conversation avatar */}
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/8">
          <Feather name="book-open" size={16} color="#C9973A" />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text className="font-serif text-base font-medium text-ink" numberOfLines={1}>
            {state.title}
          </Text>
          <Text className="font-sans text-xs text-muted/80">
            {state.messages.length === 0 ? (
              "Ready to listen"
            ) : (
              <>
                {state.messages.length} message{state.messages.length !== 1 ? "s" : ""} • 
                <Text className="text-teal"> Active</Text>
              </>
            )}
          </Text>
        </View>

        {/* Menu button */}
        <Pressable className="h-9 w-9 items-center justify-center rounded-full">
          <Feather name="more-horizontal" size={18} color="rgba(140, 123, 106, 0.6)" />
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Message list or empty state */}
        {state.messages.length === 0 ? (
          <View style={{ flex: 1 }} className="items-center justify-center px-8">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <Feather name="message-circle" size={28} color="#C9973A" />
            </View>
            <Text className="mb-2 text-center font-serif text-xl text-ink">
              Ready to Listen
            </Text>
            <Text className="text-center font-sans text-base leading-6 text-muted">
              Share what's on your heart. I'm here to offer biblical guidance and encouragement.
            </Text>
          </View>
        ) : (
          <FlatList
            data={state.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 8 }}
            onContentSizeChange={state.onScrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {/* Input bar */}
        <View className="border-t border-muted/20 bg-cream px-4 py-3">
          <View className="flex-row items-end">
            <View style={{ flex: 1, marginRight: 12 }}>
              <TextInput
                value={state.inputText}
                onChangeText={state.onInputChange}
                placeholder="Share what's on your heart..."
                placeholderTextColor="rgba(140, 123, 106, 0.6)"
                multiline
                maxLength={500}
                className="max-h-24 rounded-2xl border border-muted/25 bg-white px-4 py-3 font-sans text-base text-ink"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            <Pressable
              onPress={state.onSend}
              disabled={!state.canSend}
              className="h-12 w-12 items-center justify-center rounded-full shadow-sm"
              style={{ 
                backgroundColor: state.canSend ? "#C9973A" : "#E8E0D6" 
              }}
            >
              <Feather
                name="send"
                size={17}
                color={state.canSend ? "#FFFFFF" : "rgba(140, 123, 106, 0.5)"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}