import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Location, Panorama, getLocationsByBuilding, getPanoramasByLocation, checkInternetConnection } from '../services/api';
import { RootStackParamList } from '../types/navigation';

type LocationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Locations'>;

type TabType = 'locations' | 'rooms';

export default function LocationsScreen({ route, navigation }: LocationsScreenProps) {
  const { building } = route.params;
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('locations');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isConnected = await checkInternetConnection();
      setIsOffline(!isConnected);

      const locationsData = await getLocationsByBuilding(building.id);
      setLocations(locationsData);
    } catch (err: any) {
      console.error('[Locations] Error loading locations:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const commonLocations = locations.filter((loc) => loc.type === 'location');
  const rooms = locations.filter((loc) => loc.type === 'room');

  const filteredRooms = searchQuery.trim()
    ? rooms.filter((room) => {
        const query = searchQuery.toLowerCase();
        return (
          room.name.toLowerCase().includes(query) ||
          room.description?.toLowerCase().includes(query) ||
          (room.floor && room.floor.toString().includes(query))
        );
      })
    : rooms;

  const groupedRooms = Array.from(
    new Set(filteredRooms.map((r) => r.floor || 0))
  )
    .sort((a, b) => a - b)
    .map((floor) => ({
      floor,
      rooms: filteredRooms.filter((r) => (r.floor || 0) === floor),
    }));

  const handleLocationPress = async (location: Location) => {
    try {
      const panoramas = await getPanoramasByLocation(location.id);
      navigation.navigate('Panorama', { location, panoramas });
    } catch (err: any) {
      console.error('[Locations] Error loading panoramas:', err);
      alert('Ошибка загрузки панорам');
    }
  };

  const renderLocationCard = ({ item }: { item: Location }) => (
    <Pressable style={styles.locationCard} onPress={() => handleLocationPress(item)}>
      {item.previewUrl ? (
        <Image source={{ uri: item.previewUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.placeholderIcon}>📍</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || 'Нет описания'}
        </Text>
      </View>
    </Pressable>
  );

  const renderRoomCard = ({ item }: { item: Location }) => (
    <Pressable style={styles.roomCard} onPress={() => handleLocationPress(item)}>
      {item.previewUrl ? (
        <Image source={{ uri: item.previewUrl }} style={styles.roomImage} resizeMode="cover" />
      ) : (
        <View style={styles.roomImagePlaceholder}>
          <Text style={styles.placeholderIcon}>🚪</Text>
        </View>
      )}
      <View style={styles.roomContent}>
        <Text style={styles.roomTitle}>{item.name}</Text>
        <Text style={styles.roomDescription} numberOfLines={2}>
          {item.description || 'Нет описания'}
        </Text>
      </View>
      <Text style={styles.roomArrow}>›</Text>
    </Pressable>
  );

  const renderSectionHeader = ({ section }: { section: { floor: number; rooms: Location[] } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.floor} этаж</Text>
      <Text style={styles.sectionCount}>
        {section.rooms.length} {section.rooms.length === 1 ? 'кабинет' : section.rooms.length < 5 ? 'кабинета' : 'кабинетов'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1B3A6B" />
          <Text style={styles.loadingText}>Загрузка локаций...</Text>
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
          <Pressable style={styles.retryButton} onPress={loadLocations}>
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
        <Text style={styles.headerTitle}>{building.name}</Text>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠️ Нет подключения</Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'locations' && styles.tabActive]}
          onPress={() => setActiveTab('locations')}
        >
          <Text style={[styles.tabText, activeTab === 'locations' && styles.tabTextActive]}>
            Локации
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'rooms' && styles.tabActive]}
          onPress={() => setActiveTab('rooms')}
        >
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.tabTextActive]}>
            Кабинеты
          </Text>
        </Pressable>
      </View>

      {activeTab === 'rooms' && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск кабинета..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>
      )}

      {activeTab === 'locations' ? (
        <FlatList
          data={commonLocations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocationCard}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={<View style={styles.bottomPadding} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Локации не найдены</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={groupedRooms}
          keyExtractor={(item) => `floor-${item.floor}`}
          renderItem={({ item: section }) => (
            <View>
              {renderSectionHeader({ section })}
              {section.rooms.map((room) => (
                <View key={room.id}>{renderRoomCard({ item: room })}</View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<View style={styles.bottomPadding} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Кабинеты не найдены</Text>
            </View>
          }
        />
      )}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#D6E4FF',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0B1437',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  bottomPadding: {
    height: 20,
  },
  locationCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    color: '#94A3B8',
    fontSize: 13,
  },
  roomCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roomImage: {
    width: 120,
    height: 120,
  },
  roomImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  roomTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  roomDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  roomArrow: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});
