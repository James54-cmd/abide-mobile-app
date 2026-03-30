import { colors } from "@/constants/theme";
import { useHomeScreenState } from "@/features/home/hooks/useHomeScreenState";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StreakFlame({ days }: { days: number }) {
  return (
    <View style={styles.streakPill}>
      <Text style={{ fontSize: 14 }}>🔥</Text>
      <Text style={styles.streakText}>{days}-day streak</Text>
    </View>
  );
}

export function HomeScreen() {
  const {
    name,
    verse,
    streakDays,
    conversations,
    onHeartPress,
    onConversationPress,
    onSettingsPress,
  } = useHomeScreenState();

  const firstName = name.split(" ")[0];
  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingLabel}>{greeting}</Text>
            <Text style={styles.greetingName}>{firstName} ✦</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.treeBadge}>
              <Text style={{ fontSize: 22 }}>🌳</Text>
            </View>
            <Pressable
              style={styles.iconBadge}
              onPress={onSettingsPress}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={20} color={colors.gold} />
            </Pressable>
          </View>
        </View>

        <View style={styles.verseCard}>
          <View style={styles.verseAccentBar} />
          <View style={styles.verseInner}>
            <Text style={styles.verseLabel}>{"TODAY'S VERSE"}</Text>
            <Text style={styles.verseText}>&ldquo;{verse.text}&rdquo;</Text>
            <View style={styles.verseReferenceRow}>
              <View style={styles.verseDivider} />
              <Text style={styles.verseReference}>{verse.reference}</Text>
            </View>
          </View>
        </View>

        <View style={styles.streakRow}>
          <StreakFlame days={streakDays} />
          <Text style={styles.streakHint}>Keep going — you&apos;re building something beautiful.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.heartPrompt, pressed && { opacity: 0.85 }]}
          onPress={onHeartPress}
          accessibilityRole="button"
          accessibilityLabel="What's on your heart today?"
        >
          <View style={styles.heartPromptInner}>
            <View>
              <Text style={styles.heartPromptTitle}>What&apos;s on your heart?</Text>
              <Text style={styles.heartPromptSub}>Start a conversation with Abide</Text>
            </View>
            <View style={styles.heartPromptIcon}>
              <Feather name="edit-3" size={18} color={colors.gold} />
            </View>
          </View>
        </Pressable>

        {conversations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <View style={styles.sectionLine} />
            </View>

            {conversations.slice(0, 3).map((item, index) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.convCard,
                  index > 0 && { marginTop: 10 },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => onConversationPress(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open conversation ${item.title}`}
              >
                <View style={styles.convAccent} />
                <View style={styles.convContent}>
                  <Text style={styles.convTitle}>{item.title}</Text>
                  <Text style={styles.convMessage} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.muted} style={{ opacity: 0.5 }} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexGrow: 1,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greetingLabel: {
    fontFamily: "sans",
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  greetingName: {
    fontFamily: "serif",
    fontSize: 32,
    color: colors.ink,
    lineHeight: 36,
  },
  treeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(201,151,58,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(201,151,58,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  verseCard: {
    borderRadius: 16,
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.2)",
    overflow: "hidden",
    shadowColor: "rgba(44,31,14,0.08)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    flexDirection: "row",
  },
  verseAccentBar: {
    width: 4,
    backgroundColor: colors.gold,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  verseInner: {
    flex: 1,
    padding: 20,
  },
  verseLabel: {
    fontFamily: "sans",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 10,
  },
  verseText: {
    fontFamily: "serif",
    fontSize: 19,
    lineHeight: 28,
    color: colors.ink,
    fontStyle: "italic",
  },
  verseReferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  verseDivider: {
    width: 24,
    height: 1,
    backgroundColor: "rgba(201,151,58,0.4)",
  },
  verseReference: {
    fontFamily: "sans-medium",
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.3,
  },

  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(201,151,58,0.1)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  streakText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.ink,
  },
  streakHint: {
    fontFamily: "sans",
    fontSize: 12,
    color: colors.muted,
    flex: 1,
    lineHeight: 16,
  },

  heartPrompt: {
    borderRadius: 16,
    backgroundColor: colors.gold,
    marginBottom: 28,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  heartPromptInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  heartPromptTitle: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
  },
  heartPromptSub: {
    fontFamily: "sans",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  heartPromptIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "sans-medium",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.muted,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(140,123,106,0.2)",
  },

  convCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFAF4",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.12)",
    overflow: "hidden",
  },
  convAccent: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: "rgba(201,151,58,0.35)",
  },
  convContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  convTitle: {
    fontFamily: "sans-medium",
    fontSize: 15,
    color: colors.ink,
    marginBottom: 3,
  },
  convMessage: {
    fontFamily: "sans",
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
