import { useCallback, useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { CampusLocation } from "../types/navigation";
import { fetchLocationsFromApi } from "../services/api";

type UseLocationsResult = {
  locations: CampusLocation[];
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = useCallback(async (forceRefresh = false) => {
    try {
      const netInfoState = await NetInfo.fetch();
      const hasInternet = netInfoState.isConnected && netInfoState.isInternetReachable;

      if (!hasInternet) {
        setIsOffline(true);
        setIsLoading(false);
        setIsRefreshing(false);

        try {
          const cachedLocations = await fetchLocationsFromApi(false);
          if (cachedLocations.length > 0) {
            setLocations(cachedLocations);
            setError(null);
          } else {
            setError("Нет сохраненных данных. Проверьте подключение к интернету.");
          }
        } catch (cacheError) {
          setError("Нет интернета и нет сохраненных данных.");
        }

        return;
      }

      setIsOffline(false);
      setError(null);

      const data = await fetchLocationsFromApi(forceRefresh);
      setLocations(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить локации";
      setError(message);

      if (!forceRefresh) {
        try {
          const cachedLocations = await fetchLocationsFromApi(false);
          if (cachedLocations.length > 0) {
            setLocations(cachedLocations);
          }
        } catch (cacheError) {
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadLocations(true);
  }, [loadLocations]);

  useEffect(() => {
    loadLocations(true);
  }, [loadLocations]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const hasInternet = state.isConnected && state.isInternetReachable;
      if (hasInternet && isOffline) {
        loadLocations(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOffline, loadLocations]);

  return {
    locations,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    refresh,
  };
}
