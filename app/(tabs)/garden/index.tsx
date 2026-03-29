import { GardenScreen } from "@/features/garden/screens/GardenScreen";

export default function GardenRoute() {
  return <GardenScreen streakDays={12} stage={4} engagedToday={false} />;
}
