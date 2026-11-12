import api from "./api";

export interface DeleteMyAccountResult {
  deletedUserId: string;
  cooldownDays: number;
  isPermanentlyBlocked: boolean;
}

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

/**
 * Permanently deletes the signed-in user's account and PII while recording
 * a one-way hashed re-registration cooldown/blocklist guard on the backend.
 */
export async function deleteMyAccountAPI(
  confirmation: "DELETE" = "DELETE",
): Promise<DeleteMyAccountResult> {
  const response = await api.delete("/users/me", {
    data: { confirmation },
  });
  const data = response.data?.data;
  if (!data || typeof data.deletedUserId !== "string") {
    throw new Error("Unexpected response from account deletion endpoint.");
  }
  return data as DeleteMyAccountResult;
}
