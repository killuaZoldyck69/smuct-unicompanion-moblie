export interface LogoutDependencies {
  unregisterPushToken: () => Promise<void>;
  signOutRemote: () => Promise<void>;
  clearLocalSession: () => Promise<void>;
  clearQueryCache: () => void;
  navigateToLogin: () => void;
}

export interface LogoutCleanupResult {
  pushUnregistered: boolean;
  remoteRevoked: boolean;
  localCleared: boolean;
}

/**
 * Executes a local-first sign-out flow so offline devices or failed remote calls
 * still purge local auth storage, clear cached queries, and navigate back to login.
 */
export async function executeLogoutCleanup(
  deps: LogoutDependencies
): Promise<LogoutCleanupResult> {
  let pushUnregistered = false;
  let remoteRevoked = false;
  let localCleared = false;

  try {
    const results = await Promise.allSettled([
      deps.unregisterPushToken(),
      deps.signOutRemote(),
    ]);
    pushUnregistered = results[0].status === "fulfilled";
    remoteRevoked = results[1].status === "fulfilled";
  } finally {
    try {
      await deps.clearLocalSession();
      localCleared = true;
    } catch {
      localCleared = false;
    } finally {
      deps.clearQueryCache();
      deps.navigateToLogin();
    }
  }

  return { pushUnregistered, remoteRevoked, localCleared };
}
