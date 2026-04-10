import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { City, Building, Location, Panorama, getCities, getBuildingsByCity, getLocationsByBuilding, getPanoramasByLocation, checkInternetConnection } from '../services/api';
import { RootStackParamList } from '../types/navigation';

type CitiesScreenProps = NativeStackScreenProps<RootStackParamList, 'Cities'>;

export default function CitiesScreen({ navigation }: CitiesScreenProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isConnected = await checkInternetConnection();
      setIsOffline(!isConnected);

      const citiesData = await getCities();
      setCities(citiesData);
    } catch (err: any) {
      console.error('[Cities] Error loading cities:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <Pressable
      style={styles.cityCard}
      onPress={async () => {
        try {
          const buildings = await getBuildingsByCity(item.id);
          navigation.navigate('Buildings', { city: item });
        } catch (err: any) {
          console.error('[Cities] Error loading buildings:', err);
          alert('Ошибка загрузки корпусов');
        }
      }}
    >
      <View style={styles.cityIcon}>
        <Text style={styles.cityIconText}>🏙️</Text>
      </View>
      <View style={styles.cityContent}>
        <Text style={styles.cityName}>{item.name}</Text>
        {item.country && (
          <Text style={styles.cityCountry}>{item.country}</Text>
        )}
      </View>
      <Text style={styles.cityArrow}>›</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1B3A6B" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadCities}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>РЭУ</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.collegeName}>РЭУ им. Г.В. Плеханова</Text>
            <Text style={styles.subtitle}>Панорамы кампуса 360°</Text>
          </View>
        </View>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠️ Нет подключения — данные из кэша</Text>
          </View>
        )}
      </View>

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        renderItem={renderCityItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  logoText: {
    color: '#0B1437',
    fontSize: 16,
    fontWeight: '800',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  collegeName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  offlineBanner: {
    marginTop: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 8,
    padding: 8,
  },
  offlineText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 20,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(27, 58, 107, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cityIconText: {
    fontSize: 24,
  },
  cityContent: {
    flex: 1,
  },
  cityName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cityCountry: {
    color: '#94A3B8',
    fontSize: 14,
  },
  cityArrow: {
    color: '#64748B',
    fontSize: 28,
    fontWeight: '300',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1B3A6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
