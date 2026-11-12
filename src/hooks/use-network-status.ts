import { useNetworkState } from "expo-network";

/**
 * Lightweight hook wrapping expo-network's reactive state.
 * Only reports offline once connectivity is explicitly false.
 */
export function useNetworkStatus() {
  const networkState = useNetworkState();
  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  return {
    isOffline,
    isOnline: !isOffline,
    networkState,
  };
}
