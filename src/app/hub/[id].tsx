import { useLocalSearchParams } from "expo-router";
import { HubDetail } from "@/screens/hub-detail";

export default function CourseHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <HubDetail hubId={id as string} />;
}
