import { colors } from "@/constants/theme";
import { useSettingsScreenState } from "@/features/settings/hooks/useSettingsScreenState";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function SettingsScreen() {
  const { loading, error, onLogout } = useSettingsScreenState();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Account</Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={14} color="#b91c1c" />
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.logoutRow, pressed && { opacity: 0.85 }]}
          onPress={() => void onLogout()}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          {loading ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <Feather name="log-out" size={20} color={colors.ink} />
              <Text style={styles.logoutLabel}>Log out</Text>
            </>
          )}
        </Pressable>
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
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  title: {
    fontFamily: "serif",
    fontSize: 32,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "sans",
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.errorBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontFamily: "sans",
    fontSize: 14,
    color: "#b91c1c",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.15)",
  },
  logoutLabel: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: colors.ink,
  },
});
