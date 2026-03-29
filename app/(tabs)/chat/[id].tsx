import { useLocalSearchParams } from "expo-router";
import { ChatThreadScreen } from "@/features/chat/screens/ChatThreadScreen";

export default function ChatThreadRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ChatThreadScreen
      conversationId={id}
      messages={[
        { id: "u1", role: "user", content: "I feel overwhelmed today.", createdAt: new Date().toISOString() },
        {
          id: "a1",
          role: "assistant",
          content: "You are not alone in this moment.",
          createdAt: new Date().toISOString(),
          response: {
            intro: "Breathe. God is near.",
            verses: [
              {
                id: "v1",
                reference: "Matthew 11:28",
                text: "Come to me, all you who are weary and burdened, and I will give you rest.",
                translation: "NIV",
                relevance: "Jesus invites your tired heart."
              }
            ],
            closing: "You are carried in mercy.",
            rebuke: null,
            practicalStep: "Take 3 slow breaths and pray this verse aloud."
          }
        }
      ]}
    />
  );
}
