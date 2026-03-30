import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "@/constants/theme";
import { triggerTab } from "@/lib/native/haptics";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.parchment },
        tabBarStyle: { backgroundColor: "#F5F0E8", borderTopColor: "#C9973A33" },
        tabBarActiveTintColor: "#C9973A",
        tabBarInactiveTintColor: "#8C7B6A"
      }}
      screenListeners={{
        tabPress: () => {
          void triggerTab();
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: "Bible",
          tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: "Garden",
          tabBarIcon: ({ color, size }) => <Feather name="sun" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
