import { router } from "expo-router";
import { ChatListScreen } from "@/features/chat/screens/ChatListScreen";

export default function ChatIndexRoute() {
  return (
    <ChatListScreen
      conversations={[
        { id: "c1", title: "Anxious heart", lastMessage: "He is near to the brokenhearted.", updatedAt: new Date().toISOString() },
        { id: "c2", title: "Evening prayer", lastMessage: "Rest in His faithfulness tonight.", updatedAt: new Date().toISOString() }
      ]}
      onOpen={(id) => router.push(`/(tabs)/chat/${id}`)}
    />
  );
}
