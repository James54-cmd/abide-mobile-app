import { HomeScreen } from "@/features/home/screens/HomeScreen";

export default function HomeRoute() {
  return (
    <HomeScreen
      name="Beloved"
      streakDays={3}
      verse={{
        id: "votd",
        reference: "Psalm 46:10",
        text: "Be still, and know that I am God.",
        translation: "NIV"
      }}
      conversations={[
        { id: "c1", title: "Anxious heart", lastMessage: "You are held in grace.", updatedAt: new Date().toISOString() },
        { id: "c2", title: "Purpose today", lastMessage: "Walk in gentle obedience.", updatedAt: new Date().toISOString() },
        { id: "c3", title: "Family prayer", lastMessage: "Peace over your home.", updatedAt: new Date().toISOString() }
      ]}
    />
  );
}
