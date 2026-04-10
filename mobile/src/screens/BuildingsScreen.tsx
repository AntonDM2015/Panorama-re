import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Building, Location, getBuildingsByCity, getLocationsByBuilding, checkInternetConnection } from '../services/api';
import { RootStackParamList } from '../types/navigation';

type BuildingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Buildings'>;

export default function BuildingsScreen({ route, navigation }: BuildingsScreenProps) {
  const { city } = route.params;
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isConnected = await checkInternetConnection();
      setIsOffline(!isConnected);

      const buildingsData = await getBuildingsByCity(city.id);
      setBuildings(buildingsData);
    } catch (err: any) {
      console.error('[Buildings] Error loading buildings:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const renderBuildingItem = ({ item }: { item: Building }) => (
    <Pressable
      style={styles.buildingCard}
      onPress={async () => {
        try {
          const locations = await getLocationsByBuilding(item.id);
          navigation.navigate('Locations', { building: item });
        } catch (err: any) {
          console.error('[Buildings] Error loading locations:', err);
          alert('Ошибка загрузки локаций');
        }
      }}
    >
      {item.previewUrl ? (
        <Image source={{ uri: item.previewUrl }} style={styles.buildingImage} resizeMode="cover" />
      ) : (
        <View style={styles.buildingImagePlaceholder}>
          <Text style={styles.placeholderIcon}>🏢</Text>
        </View>
      )}
      <View style={styles.buildingContent}>
        <Text style={styles.buildingName}>{item.name}</Text>
        {item.address && (
          <Text style={styles.buildingAddress}>{item.address}</Text>
        )}
        {item.description && (
          <Text style={styles.buildingDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <Text style={styles.buildingArrow}>›</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1B3A6B" />
          <Text style={styles.loadingText}>Загрузка корпусов...</Text>
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
          <Pressable style={styles.retryButton} onPress={loadBuildings}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{city.name}</Text>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠️ Нет подключения</Text>
          </View>
        )}
      </View>

      <FlatList
        data={buildings}
        keyExtractor={(item) => item.id}
        renderItem={renderBuildingItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={styles.bottomPadding} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏗️</Text>
            <Text style={styles.emptyText}>Корпуса не найдены</Text>
          </View>
        }
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
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    marginBottom: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  offlineBanner: {
    marginTop: 8,
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
  buildingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  buildingImage: {
    width: '100%',
    height: 180,
  },
  buildingImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  buildingContent: {
    padding: 16,
  },
  buildingName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  buildingAddress: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  buildingDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  buildingArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -14,
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
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});
