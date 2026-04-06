import { ChatBubble } from "@/features/chat/components/ChatBubble";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
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
import { useMemo } from "react";

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

  // Derive title from first user message if available
  const title = useMemo(() => {
    if (state.messages.length === 0) return "New conversation";
    
    const firstUserMessage = state.messages.find(msg => msg.role === "user");
    if (firstUserMessage) {
      const derivedTitle = firstUserMessage.content.trim().slice(0, 30);
      return derivedTitle.length < firstUserMessage.content.trim().length 
        ? `${derivedTitle}...` 
        : derivedTitle;
    }
    
    return "Conversation";
  }, [state.messages]);

  const renderMessage: ListRenderItem<ChatMessage> = ({ item: message }) => {
    return (
      <View className="px-4 py-1">
        <ChatBubble message={message} />
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
            {title}
          </Text>
          <Text className="font-sans text-xs text-muted/80">
            {state.loading ? (
              "Loading..."
            ) : state.messages.length === 0 ? (
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
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-gold/20 to-gold/10">
              <Feather name="heart" size={32} color="#C9973A" />
            </View>
            <Text className="mb-3 text-center font-serif text-2xl text-ink">
              Welcome to Abide
            </Text>
            <Text className="mb-6 text-center font-sans text-base leading-6 text-muted">
              I'm here to offer biblical guidance, share encouraging Scripture, and remind you of God's love. 
              Feel comfortable sharing your heart – struggles, questions, or celebrations.
            </Text>
            
            <View className="w-full max-w-sm">
              <View className="mb-3 flex-row items-start rounded-lg bg-cream p-3">
                <Feather name="book-open" size={16} color="#C9973A" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text className="font-sans-medium text-sm text-ink">Scripture & Stories</Text>
                  <Text className="font-sans text-xs leading-4 text-muted">
                    I'll share relevant Bible verses and stories of biblical characters who faced similar situations.
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-start rounded-lg bg-teal/8 p-3">
                <Feather name="users" size={16} color="#58A6AF" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text className="font-sans-medium text-sm text-ink">Community Connection</Text>
                  <Text className="font-sans text-xs leading-4 text-muted">
                    I'll encourage you to connect with your pastor or church community for prayer and support.
                  </Text>
                </View>
              </View>
            </View>
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
            ListFooterComponent={state.sending ? <TypingIndicator /> : undefined}
          />
        )}
        
        {/* Error state */}
        {state.error && (
          <View className="mx-4 mb-2 flex-row items-start rounded-lg border border-red-200 bg-red-50 p-3">
            <Feather name="alert-circle" size={16} color="#DC2626" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text className="font-sans-medium text-sm text-red-700">
                Something went wrong
              </Text>
              <Text className="mb-2 font-sans text-sm text-red-600">
                {state.error}
              </Text>
              <Pressable onPress={state.refetch} className="self-start">
                <Text className="font-sans text-sm text-red-600 underline">
                  Try again
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Input bar */}
        <View className="border-t border-muted/20 bg-cream px-4 py-3">
          <View className="flex-row items-end">
            <View style={{ flex: 1, marginRight: 12 }}>
              <View className="relative">
                <TextInput
                  value={state.inputText}
                  onChangeText={state.onInputChange}
                  placeholder="Share what's on your heart..."
                  placeholderTextColor="rgba(140, 123, 106, 0.6)"
                  multiline
                  maxLength={500}
                  className="max-h-24 rounded-2xl border border-muted/25 bg-white px-4 py-3 pr-12 font-sans text-base text-ink"
                  style={{ textAlignVertical: "top" }}
                />
                
                {/* Character counter */}
                {state.inputText.length > 0 && (
                  <View 
                    className="absolute bottom-2 right-3 rounded-full bg-parchment px-2 py-1"
                  >
                    <Text className="font-sans text-xs text-muted">
                      {state.inputText.length}/500
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Pressable
              onPress={state.onSend}
              disabled={!state.canSend}
              className="h-12 w-12 items-center justify-center rounded-full shadow-sm"
              style={{ 
                backgroundColor: state.canSend ? "#C9973A" : "#E8E0D6",
                transform: [{ scale: state.sending ? 0.95 : 1 }],
              }}
            >
              <Feather
                name={state.sending ? "loader" : "send"}
                size={17}
                color={state.canSend ? "#FFFFFF" : "rgba(140, 123, 106, 0.5)"}
                style={{
                  transform: [{ 
                    rotate: state.sending ? "0deg" : "0deg" 
                  }],
                }}
              />
            </Pressable>
          </View>
          
          {/* Helpful hint */}
          {state.messages.length === 0 && (
            <Text className="mt-2 text-center font-sans text-xs text-muted/80">
              💝 Feel free to share struggles, questions, or prayer requests
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}