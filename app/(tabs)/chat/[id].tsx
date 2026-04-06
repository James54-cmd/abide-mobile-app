import { ChatThreadScreen } from "@/features/chat/screens/ChatThreadScreen";
import { useLocalSearchParams } from "expo-router";

export default function ChatThreadRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id || typeof id !== 'string') {
    // Handle invalid/missing conversation ID
    return null; // or redirect to chat list
  }
  
  return <ChatThreadScreen conversationId={id} />;
}
