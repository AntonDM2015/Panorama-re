import React, { useState } from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CampusLocation, RootStackParamList } from "../types/navigation";
import { ALL_LOCATIONS, ALL_FLOORS } from "../constants/locations";

type LocationsScreenProps = NativeStackScreenProps<RootStackParamList, "Locations">;

type TabType = "locations" | "rooms";

export default function LocationsScreen({ navigation }: LocationsScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>("locations");
  const [searchQuery, setSearchQuery] = useState("");

  const commonLocations = ALL_LOCATIONS.filter((loc) => loc.category === "common");
  const rooms = ALL_LOCATIONS.filter((loc) => loc.category === "room");

  const filteredRooms = searchQuery.trim()
    ? rooms.filter((room) => {
        const query = searchQuery.toLowerCase();
        return (
          room.title.toLowerCase().includes(query) ||
          room.description.toLowerCase().includes(query) ||
          (room.floor && room.floor.toString().includes(query))
        );
      })
    : rooms;

  const groupedRooms = ALL_FLOORS.map((floor) => ({
    floor: floor.floorNumber,
    rooms: filteredRooms.filter((room) => room.floor === floor.floorNumber),
  })).filter((group) => group.rooms.length > 0);

  const renderLocationCard: ListRenderItem<CampusLocation> = ({ item }) => {
    const previewPanorama = item.panoramas[0];

    return (
      <Pressable
        style={styles.locationCard}
        onPress={() =>
          navigation.navigate("Panorama", {
            locationId: item.id,
            location: item,
            initialPanoramaIndex: 0,
          })
        }
      >
        <View style={styles.cardImageContainer}>
          <Image source={previewPanorama.url} style={styles.cardImage} resizeMode="cover" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderRoomCard: ListRenderItem<CampusLocation> = ({ item }) => {
    const previewPanorama = item.panoramas[0];

    return (
      <Pressable
        style={styles.roomCard}
        onPress={() =>
          navigation.navigate("Panorama", {
            locationId: item.id,
            location: item,
            initialPanoramaIndex: 0,
          })
        }
      >
        <View style={styles.roomImageContainer}>
          <Image source={previewPanorama.url} style={styles.roomImage} resizeMode="cover" />
        </View>
        <View style={styles.roomContent}>
          <Text style={styles.roomTitle}>{item.title}</Text>
          <Text style={styles.roomDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.roomArrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { floor: number; rooms: CampusLocation[] } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.floor} этаж</Text>
      <Text style={styles.sectionCount}>
        {section.rooms.length} {section.rooms.length === 1 ? "кабинет" : section.rooms.length < 5 ? "кабинета" : "кабинетов"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
                <View style={styles.brandRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>РЭУ</Text>
          </View>
          <View style={styles.brandTextContainer}>
            <Text style={styles.collegeName}>РЭУ им. Г.В. Плеханова</Text>
            <Text style={styles.collegeSubtitle}>Панорамы кампуса 360°</Text>
          </View>
        </View>
<Text style={styles.headerTitle}>Панорамы кампуса 360°</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === "locations" ? "Выберите локацию для просмотра" : "Выберите кабинет для просмотра"}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "locations" && styles.tabActive]}
          onPress={() => setActiveTab("locations")}
        >
          <Text style={[styles.tabText, activeTab === "locations" && styles.tabTextActive]}>
            Локации
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "rooms" && styles.tabActive]}
          onPress={() => setActiveTab("rooms")}
        >
          <Text style={[styles.tabText, activeTab === "rooms" && styles.tabTextActive]}>
            Кабинеты
          </Text>
        </Pressable>
      </View>

      {activeTab === "rooms" && (
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
            <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>
      )}

      {activeTab === "locations" ? (
        <FlatList
          data={commonLocations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocationCard}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={<View style={styles.bottomPadding} />}
        />
      ) : (
        <FlatList
          data={groupedRooms}
          keyExtractor={(item) => `floor-${item.floor}`}
          renderItem={({ item: section }) => (
            <View>
              {renderSectionHeader({ section })}
              {section.rooms.map((room) => (
                <View key={room.id}>{renderRoomCard({ item: room, index: 0, separators: {} as any })}</View>
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

      <Pressable
        style={styles.freeNavigationButton}
        onPress={() => navigation.navigate("FreeNavigation", {})}
      >
        <View style={styles.freeNavigationIcon}>
          <Text style={styles.freeNavigationIconText}>🗺️</Text>
        </View>
        <View style={styles.freeNavigationContent}>
          <Text style={styles.freeNavigationTitle}>Свободное перемещение</Text>
          <Text style={styles.freeNavigationDescription}>
            Исследуйте кампус и колледж свободно
          </Text>
        </View>
        <Text style={styles.freeNavigationArrow}>›</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1437",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  logoText: {
    color: "#0B1437",
    fontSize: 16,
    fontWeight: "800",
  },
  brandTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  collegeName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  collegeSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#1E2A4A",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#D6E4FF",
  },
  tabText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#0B1437",
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#1E2A4A",
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
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 12,
  },
  bottomPadding: {
    height: 100,
  },
  locationCard: {
    backgroundColor: "#D6E4FF",
    borderRadius: 20,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#C7D7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    color: "#0B1437",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDescription: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    backgroundColor: "#1E2A4A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCount: {
    color: "#94A3B8",
    fontSize: 13,
  },
  roomCard: {
    backgroundColor: "#1E2A4A",
    borderRadius: 16,
    flexDirection: "row",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A3A5C",
  },
  roomImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#2A3A5C",
    flexShrink: 0,
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  roomContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  roomTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  roomDescription: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
  },
  roomArrow: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#64748B",
    fontSize: 28,
    fontWeight: "300",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  freeNavigationButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1D4ED8",
  },
  freeNavigationIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  freeNavigationIconText: {
    fontSize: 28,
  },
  freeNavigationContent: {
    flex: 1,
  },
  freeNavigationTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  freeNavigationDescription: {
    color: "#BFDBFE",
    fontSize: 13,
  },
  freeNavigationArrow: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
  },
});
