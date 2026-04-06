import { colors } from "@/constants/theme";
import type { ChatMessage } from "@/types";
import { StyleSheet, Text, View } from "react-native";
import { EnhancedEncouragementCard } from "./EnhancedEncouragementCard";

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  // For assistant messages with enhanced encouragement, show structured layout
  if (!isUser && message.encouragement) {
    return (
      <View style={styles.wrapAssistant}>
        <View style={styles.assistantRow}>
          <View style={styles.accentBar} />
          <View style={styles.bubbleAssistant}>
            <EnhancedEncouragementCard encouragement={message.encouragement} />
          </View>
        </View>
      </View>
    );
  }

  // Standard message layout (user messages and assistant without encouragement)
  return (
    <View style={isUser ? styles.wrapUser : styles.wrapAssistant}>
      {isUser ? (
        <View style={styles.bubbleUser}>
          <Text style={styles.textUser}>{message.content}</Text>
        </View>
      ) : (
        <View style={styles.assistantRow}>
          <View style={styles.accentBar} />
          <View style={styles.bubbleAssistant}>
            <Text style={styles.textAssistant}>{message.content}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapUser: {
    alignItems: "flex-end",
    marginBottom: 4,
  },
  wrapAssistant: {
    alignItems: "flex-start",
    marginBottom: 4,
  },

  // User
  bubbleUser: {
    maxWidth: "82%",
    borderRadius: 20,
    borderBottomRightRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: colors.gold,
  },
  textUser: {
    fontFamily: "sans",
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
  },

  // Assistant — row with a separate accent bar View
  assistantRow: {
    flexDirection: "row",
    alignItems: "stretch",
    maxWidth: "90%", // Increased to accommodate enhanced content
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(201,151,58,0.18)",
    backgroundColor: colors.white,
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.gold,
  },
  bubbleAssistant: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textAssistant: {
    fontFamily: "sans",
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
});