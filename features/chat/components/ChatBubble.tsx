import { colors } from "@/constants/theme";
import type { ChatMessage } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { EnhancedEncouragementCard } from "./EnhancedEncouragementCard";
import { 
  isLoadingPlaceholder, 
  isMessageFailed, 
  isMessageSending 
} from "../utils/messageHelpers";

interface Props {
  message: ChatMessage;
  onRetry?: () => void;
}

/**
 * Inline typing indicator component for loading assistant messages
 */
function InlineTypingIndicator() {
  const dotAnimation1 = useRef(new Animated.Value(0.3)).current;
  const dotAnimation2 = useRef(new Animated.Value(0.3)).current;
  const dotAnimation3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (animatedValue: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );

      Animated.stagger(200, [
        createAnimation(dotAnimation1, 0),
        createAnimation(dotAnimation2, 0),
        createAnimation(dotAnimation3, 0),
      ]).start();
    };

    animateDots();
  }, [dotAnimation1, dotAnimation2, dotAnimation3]);

  return (
    <View style={typingStyles.content}>
      <Feather name="book-open" size={16} color={colors.gold} />
      <Text style={typingStyles.text}>Abide is reflecting...</Text>
      <View style={typingStyles.dotsContainer}>
        <Animated.View style={[typingStyles.dot, { opacity: dotAnimation1 }]} />
        <Animated.View style={[typingStyles.dot, { opacity: dotAnimation2 }]} />
        <Animated.View style={[typingStyles.dot, { opacity: dotAnimation3 }]} />
      </View>
    </View>
  );
}

const typingStyles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: "sans",
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
    marginLeft: 8, // More space after icon
    marginRight: 10, // More space before dots
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 7, // Slightly larger for better visibility
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold,
    marginHorizontal: 1.5, // More spacing between dots
  },
});

export function ChatBubble({ message, onRetry }: Props) {
  const isUser = message.role === "user";
  const isFailed = isMessageFailed(message);
  const isSending = isMessageSending(message);
  const isLoading = isLoadingPlaceholder(message);

  // For assistant loading placeholder, show typing indicator
  if (isLoading) {
    return (
      <View style={styles.wrapAssistant}>
        <View style={styles.assistantRow}>
          <View style={styles.accentBar} />
          <View style={styles.bubbleAssistant}>
            <InlineTypingIndicator />
          </View>
        </View>
      </View>
    );
  }

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

  // Failed message with retry option
  if (isFailed && onRetry) {
    return (
      <View style={isUser ? styles.wrapUser : styles.wrapAssistant}>
        {isUser ? (
          <View style={[styles.bubbleUser, styles.bubbleFailed]}>
            <Text style={styles.textUser}>{message.content}</Text>
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Feather name="refresh-cw" size={14} color={colors.white} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.assistantRow}>
            <View style={[styles.accentBar, styles.accentBarFailed]} />
            <View style={styles.bubbleAssistant}>
              <Text style={styles.textAssistant}>{message.content}</Text>
              <TouchableOpacity onPress={onRetry} style={styles.retryButtonAssistant}>
                <Feather name="refresh-cw" size={14} color={colors.muted} />
                <Text style={styles.retryTextAssistant}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Standard message layout (user messages and assistant without encouragement)
  return (
    <View style={isUser ? styles.wrapUser : styles.wrapAssistant}>
      {isUser ? (
        <View style={[
          styles.bubbleUser,
          isSending && styles.bubbleSending
        ]}>
          <Text style={styles.textUser}>{message.content}</Text>
          {isSending && (
            <View style={styles.sendingIndicator}>
              <Text style={styles.sendingText}>Sending...</Text>
            </View>
          )}
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
    marginBottom: 6, // Slightly increased for better rhythm
    paddingHorizontal: 4, // Subtle breathing room
  },
  wrapAssistant: {
    alignItems: "flex-start",
    marginBottom: 6,
    paddingHorizontal: 4,
  },

  // User - polished for premium feel
  bubbleUser: {
    maxWidth: "85%", // Slightly wider for better readability
    borderRadius: 22, // More pronounced rounding
    borderBottomRightRadius: 6, // Chat tail style
    paddingHorizontal: 18, // More generous padding
    paddingVertical: 12,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Subtle depth
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  bubbleSending: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }], // Subtle size feedback
  },
  bubbleFailed: {
    backgroundColor: "rgba(201,151,58,0.6)",
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.8)",
  },
  textUser: {
    fontFamily: "sans",
    fontSize: 15,
    lineHeight: 21, // Optimized line height
    color: colors.white,
    fontWeight: "500", // Slightly heavier for readability
  },
  sendingIndicator: {
    marginTop: 6,
    alignItems: "flex-end",
  },
  sendingText: {
    fontFamily: "sans",
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
  },

  // Assistant — premium styling with refined spacing
  assistantRow: {
    flexDirection: "row",
    alignItems: "stretch",
    maxWidth: "92%", // Even more generous for encouragement content
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, // Very subtle shadow
    shadowRadius: 3,
    elevation: 2,
  },
  accentBar: {
    width: 4, // Slightly thicker for more presence
    backgroundColor: colors.gold,
  },
  accentBarFailed: {
    backgroundColor: "rgba(220,38,38,0.7)", // Red for failed state
  },
  bubbleAssistant: {
    flex: 1,
    paddingHorizontal: 16, // More generous padding
    paddingVertical: 14,
  },
  textAssistant: {
    fontFamily: "sans",
    fontSize: 15,
    lineHeight: 23, // More spacious for readability
    color: colors.ink,
  },

  // Retry buttons with improved styling
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  retryText: {
    fontFamily: "sans",
    fontSize: 12,
    color: colors.white,
    marginLeft: 4,
    fontWeight: "500",
  },
  retryButtonAssistant: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  retryTextAssistant: {
    fontFamily: "sans",
    fontSize: 12,
    color: colors.muted,
    marginLeft: 4,
    fontWeight: "500",
  },
});