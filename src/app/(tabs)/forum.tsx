import { CampusHub } from "@/screens/campus-hub";
import { useLocalSearchParams } from "expo-router";

export default function ForumFeedScreen() {
  const { section } = useLocalSearchParams<{ section?: any }>();
  return <CampusHub initialSection={section} />;
}
