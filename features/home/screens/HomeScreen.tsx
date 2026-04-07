import { colors } from "@/constants/theme";
import { useHomeScreenState } from "@/features/home/hooks/useHomeScreenState";
import type { DevotionalModuleKind, HomeScreenProps } from "@/features/home/types";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FeatherName = ComponentProps<typeof Feather>["name"];

function moduleIcon(kind: DevotionalModuleKind): FeatherName {
  switch (kind) {
    case "quote":
      return "feather";
    case "passage":
      return "book-open";
    case "devotional":
      return "message-square";
    case "prayer":
      return "heart";
    default:
      return "circle" as FeatherName;
  }
}

export function HomeScreen() {
  return <HomeScreenView {...useHomeScreenState()} />;
}

export function HomeScreenView({
  userInitial,
  headerTitle,
  streakCount,
  weekDays,
  calendarLinkLabel,
  onCalendarPress,
  onCommunityPress,
  quoteImage,
  quoteText,
  quoteAuthor,
  quoteSourceLabel,
  quoteTheme,
  quoteCompleted,
  onQuoteCompletePress,
  dateLabel,
  dailyTopicTitle,
  dailySectionLabel,
  isFavorite,
  onFavoritePress,
  modules,
  onModulePress,
  onPassageListen,
  onPassageRead,
  onPrimaryPromptPress,
  primaryPromptTitle,
  primaryPromptSubtitle,
  conversations,
  onConversationPress,
  onSettingsPress,
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.stickyHeader}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <View style={styles.topBarRight}>
            <View style={styles.streakPill}>
              <Feather name="zap" size={14} color={colors.gold} />
              <Text style={styles.streakPillText}>{streakCount}</Text>
            </View>
            <Pressable
              style={styles.iconCircle}
              onPress={onCommunityPress}
              accessibilityRole="button"
              accessibilityLabel="Community"
            >
              <Feather name="users" size={18} color={colors.ink} />
            </Pressable>
            <Pressable
              style={styles.iconCircle}
              onPress={onSettingsPress}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={18} color={colors.gold} />
            </Pressable>
          </View>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((d) => (
            <View
              key={d.id}
              style={[styles.weekDay, d.highlighted && styles.weekDayActive]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Text style={[styles.weekDayText, d.highlighted && styles.weekDayTextActive]}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onCalendarPress}
          accessibilityRole="button"
          accessibilityLabel={calendarLinkLabel}
          style={styles.calendarLink}
        >
          <Text style={styles.calendarLinkText}>{calendarLinkLabel}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground source={quoteImage} imageStyle={styles.quoteHeroImage} style={styles.quoteHero}>
          <View style={styles.quoteOverlay} />
          <View style={styles.quoteHeroContent}>
            <View style={styles.quoteTopRow}>
              <View style={styles.quoteLabelPill}>
                <Text style={styles.quoteLabelText}>{quoteSourceLabel}</Text>
              </View>
              <Pressable
                onPress={onQuoteCompletePress}
                accessibilityRole="button"
                accessibilityLabel={quoteCompleted ? "Open today's completed devotion" : "Open today's devotion"}
                style={[
                  styles.quoteCheckButton,
                  quoteCompleted && styles.quoteCheckButtonActive,
                ]}
              >
                <Feather
                  name={quoteCompleted ? "check" : "circle"}
                  size={16}
                  color={quoteCompleted ? colors.ink : colors.white}
                />
                <Text
                  style={[
                    styles.quoteCheckText,
                    quoteCompleted && styles.quoteCheckTextActive,
                  ]}
                >
                  {quoteCompleted ? "Completed" : "Open devotion"}
                </Text>
              </Pressable>
            </View>

            <View>
              <Text style={styles.quoteTheme}>{quoteTheme}</Text>
              <Text style={styles.quoteText}>"{quoteText}"</Text>
              <Text style={styles.quoteAuthor}>- {quoteAuthor}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
              <Text style={styles.topicTitle}>{dailyTopicTitle}</Text>
              <Text style={styles.dailySectionLabel}>{dailySectionLabel}</Text>
            </View>
            <Pressable
              onPress={onFavoritePress}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? "Remove from favorites" : "Favorite or save"}
              hitSlop={10}
              style={styles.favoriteButton}
            >
              <Feather
                name={isFavorite ? "heart" : "heart"}
                size={22}
                color={isFavorite ? colors.gold : colors.muted}
              />
            </Pressable>
          </View>

          <View>
            {modules.map((m, index) => (
              <View
                key={m.id}
                style={[styles.moduleCard, index > 0 && styles.moduleCardSpacing]}
              >
                <View style={styles.moduleAccent} />
                <View style={styles.moduleInner}>
                  <View style={styles.moduleRow}>
                    <View style={styles.moduleIconWrap}>
                      <Feather name={moduleIcon(m.kind)} size={18} color={colors.gold} />
                    </View>
                    <Text
                      style={[
                        styles.moduleTitle,
                        m.kind === "passage" && styles.moduleTitleAccent,
                      ]}
                    >
                      {m.title}
                    </Text>
                    {m.durationMinutes != null ? (
                      <Text style={styles.moduleMeta}>{m.durationMinutes} min</Text>
                    ) : (
                      <View style={styles.moduleMetaSpacer} />
                    )}
                    <View
                      style={[
                        styles.moduleCheckButton,
                        m.completed && styles.moduleCheckButtonActive,
                      ]}
                    >
                      <Feather
                        name={m.completed ? "check" : "circle"}
                        size={15}
                        color={m.completed ? colors.white : colors.muted}
                      />
                    </View>
                  </View>

                  {m.summary ? <Text style={styles.moduleSummary}>{m.summary}</Text> : null}
                  {m.body ? <Text style={styles.moduleBody}>{m.body}</Text> : null}

                  {m.kind === "passage" && m.passageReference ? (
                    <View style={styles.passageBody}>
                      <Text style={styles.passageRef}>{m.passageReference}</Text>
                      <View style={styles.passageActions}>
                        <Pressable
                          style={styles.pillDark}
                          onPress={() => onPassageListen?.(m.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Listen to passage"
                        >
                          <Text style={styles.pillDarkText}>✦ LISTEN</Text>
                        </Pressable>
                        <Pressable
                          style={styles.pillDark}
                          onPress={() => onPassageRead?.(m.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Read passage"
                        >
                          <Text style={styles.pillDarkText}>READ</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : m.actionLabel ? (
                    <Pressable
                      style={styles.moduleActionPill}
                      onPress={() => onModulePress?.(m.id, m.kind)}
                      accessibilityRole="button"
                      accessibilityLabel={m.actionLabel}
                    >
                      <Text style={styles.moduleActionText}>{m.actionLabel}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryPrompt, pressed && { opacity: 0.9 }]}
          onPress={onPrimaryPromptPress}
          accessibilityRole="button"
          accessibilityLabel={primaryPromptTitle}
        >
          <View style={styles.primaryPromptInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryPromptTitle}>{primaryPromptTitle}</Text>
              <Text style={styles.primaryPromptSub}>{primaryPromptSubtitle}</Text>
            </View>
            <View style={styles.primaryPromptIcon}>
              <Feather name="edit-3" size={18} color={colors.gold} />
            </View>
          </View>
        </Pressable>

        {conversations.length > 0 ? (
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
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => onConversationPress?.(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open conversation ${item.title}`}
              >
                <View style={styles.convAccent} />
                <View style={styles.convContent}>
                  <Text style={styles.convTitle}>{item.title}</Text>
                  <Text style={styles.convMessage} numberOfLines={1}>
                    {item.last_message}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.muted} style={{ opacity: 0.5 }} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  stickyHeader: {
    backgroundColor: colors.parchment,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(140,123,106,0.18)",
    zIndex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexGrow: 1,
  },
  quoteHero: {
    minHeight: 240,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    justifyContent: "flex-end",
    backgroundColor: colors.darkBg,
  },
  quoteHeroImage: {
    resizeMode: "cover",
  },
  quoteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,20,12,0.46)",
  },
  quoteHeroContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 20,
  },
  quoteTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quoteLabelPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(250,247,242,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  quoteLabelText: {
    fontFamily: "sans-medium",
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.white,
  },
  quoteCheckButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  quoteCheckButtonActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  quoteCheckText: {
    fontFamily: "sans-medium",
    fontSize: 12,
    color: colors.white,
  },
  quoteCheckTextActive: {
    color: colors.ink,
  },
  quoteTheme: {
    fontFamily: "sans-medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  quoteText: {
    fontFamily: "serif",
    fontSize: 28,
    lineHeight: 36,
    color: colors.white,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.88)",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  topBarLeft: {
    width: 44,
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(201,151,58,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: colors.ink,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "sans-medium",
    fontSize: 17,
    color: colors.ink,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 132,
    justifyContent: "flex-end",
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.25)",
  },
  streakPillText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.ink,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(140,123,106,0.12)",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  weekDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayActive: {
    backgroundColor: colors.gold,
  },
  weekDayText: {
    fontFamily: "sans-medium",
    fontSize: 12,
    color: colors.muted,
  },
  weekDayTextActive: {
    color: colors.white,
  },

  calendarLink: {
    alignSelf: "center",
    paddingVertical: 4,
  },
  calendarLinkText: {
    fontFamily: "sans-medium",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
  },

  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
    marginHorizontal: -4,
    shadowColor: "rgba(44,31,14,0.07)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.12)",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  sheetHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  favoriteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,151,58,0.08)",
  },
  dateLabel: {
    fontFamily: "sans-medium",
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  topicTitle: {
    fontFamily: "serif",
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
    marginBottom: 6,
  },
  dailySectionLabel: {
    fontFamily: "sans",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },

  moduleCard: {
    flexDirection: "row",
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.14)",
    shadowColor: "rgba(44,31,14,0.06)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  moduleCardSpacing: {
    marginTop: 12,
  },
  moduleAccent: {
    width: 4,
    backgroundColor: colors.gold,
  },
  moduleInner: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(201,151,58,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleTitle: {
    flex: 1,
    fontFamily: "sans-medium",
    fontSize: 15,
    color: colors.ink,
  },
  moduleTitleAccent: {
    color: colors.gold,
  },
  moduleMeta: {
    fontFamily: "sans",
    fontSize: 12,
    color: colors.muted,
  },
  moduleMetaSpacer: {
    width: 36,
  },
  moduleCheckButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(140,123,106,0.28)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
  },
  moduleCheckButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  doneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },

  passageBody: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(140,123,106,0.15)",
  },
  moduleSummary: {
    marginTop: 14,
    fontFamily: "sans-medium",
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  moduleBody: {
    marginTop: 8,
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  passageRef: {
    fontFamily: "serif",
    fontSize: 22,
    lineHeight: 30,
    color: colors.ink,
    marginBottom: 14,
  },
  passageActions: {
    flexDirection: "row",
    gap: 10,
  },
  moduleActionPill: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "rgba(201,151,58,0.12)",
  },
  moduleActionText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.ink,
  },
  pillDark: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  pillDarkText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.white,
    letterSpacing: 0.5,
  },

  primaryPrompt: {
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryPromptInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  primaryPromptTitle: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: colors.white,
    marginBottom: 2,
  },
  primaryPromptSub: {
    fontFamily: "sans",
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
  },
  primaryPromptIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  section: {
    marginTop: 24,
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
    backgroundColor: colors.dividerMuted,
  },
  convCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
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
