import api from "./api";

export async function syncGoogleDriveConnectionStatus(
  isConnected: boolean,
  email?: string | null,
): Promise<boolean> {
  const response = await api.patch("/users/me/google-drive-status", {
    isConnected,
    email: isConnected ? email : null,
  });
  const changed = response.data?.data?.changed;
  if (typeof changed !== "boolean") {
    throw new Error("The server returned an invalid Google Drive status response.");
  }
  return changed;
}
