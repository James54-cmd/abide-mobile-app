import { ChatBubble } from "@/components/ChatBubble";
import { PracticalStepChip } from "@/components/PracticalStepChip";
import { RebukeBlock } from "@/components/RebukeBlock";
import { VerseCard } from "@/components/VerseCard";
import { colors } from "@/constants/theme";
import { useChatThreadScreenState } from "@/features/chat/hooks/useChatThreadScreenState";
import type { ChatThreadScreenProps } from "@/features/chat/types";
import { triggerSend } from "@/lib/native/haptics";
import type { ChatMessage } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatThreadScreenView {...useChatThreadScreenState(id ?? "")} />;
}

export function ChatThreadScreenView({
  title,
  messages,
  onBack,
  onSendPress,
}: ChatThreadScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Feather name="chevron-left" size={24} color={colors.muted} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>Abide</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.threadEmpty}>
              <Text style={styles.threadEmptyText}>Say what&apos;s on your heart — Abide listens.</Text>
            </View>
          }
          renderItem={({ item }) => <MessageBlock message={item} />}
        />

        <View style={styles.composer}>
          <TextInput
            placeholder="Abide is listening…"
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              void triggerSend();
              onSendPress();
            }}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Feather name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBlock({ message }: { message: ChatMessage }) {
  return (
    <View style={styles.msgBlock}>
      <ChatBubble message={message} />
      {message.response ? (
        <View style={styles.responseWrap}>
          {message.response.verses.map((verse) => (
            <VerseCard key={verse.id} verse={verse} />
          ))}
          <RebukeBlock text={message.response.rebuke ?? ""} />
          <PracticalStepChip text={message.response.practicalStep} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(140,123,106,0.18)",
    backgroundColor: colors.parchment,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "serif",
    fontSize: 20,
    lineHeight: 26,
    color: colors.ink,
    textAlign: "center",
  },
  headerSub: {
    fontFamily: "sans",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  msgBlock: {
    marginBottom: 8,
  },
  responseWrap: {
    marginBottom: 8,
  },
  threadEmpty: {
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  threadEmptyText: {
    fontFamily: "sans",
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 12 : 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(201,151,58,0.2)",
    backgroundColor: colors.cream,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "sans",
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(140,123,106,0.15)",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
