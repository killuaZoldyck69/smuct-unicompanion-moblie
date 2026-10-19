import { useCurrentUser } from "@/hooks/use-current-user";
import { Home } from "@/screens/home";
import { AdminHomeScreen } from "@/screens/admin-home";

export default function HomeScreen() {
  const { role } = useCurrentUser();

  // Keep consistent with the rest of the tab layout — rely on the tab
  // layout's loading guard so isPending states are already resolved here.
  if (role === "ADMIN") {
    return <AdminHomeScreen />;
  }

  return <Home />;
}
