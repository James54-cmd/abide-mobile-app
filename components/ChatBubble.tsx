import { colors } from "@/constants/theme";
import type { ChatMessage } from "@/types";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.wrap, isUser ? styles.wrapUser : styles.wrapAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  wrapUser: {
    alignItems: "flex-end",
  },
  wrapAssistant: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "86%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.18)",
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.12)",
    shadowColor: "rgba(44,31,14,0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    fontFamily: "sans",
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
});
