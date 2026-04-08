import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PanoramaViewer from "../components/PanoramaViewer";
import { CampusLocation, NavigationLink, RootStackParamList } from "../types/navigation";
import { ALL_LOCATIONS } from "../constants/locations";

type FreeNavigationScreenProps = NativeStackScreenProps<RootStackParamList, "FreeNavigation">;

export default function FreeNavigationScreen({ route, navigation }: FreeNavigationScreenProps) {
  const { startLocationId, startPanoramaIndex = 0 } = route.params;

  const initialLocation = startLocationId
    ? ALL_LOCATIONS.find((loc) => loc.id === startLocationId)
    : ALL_LOCATIONS.find((loc) => loc.category === "common");

  const [currentLocation, setCurrentLocation] = useState<CampusLocation | undefined>(
    initialLocation
  );
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(startPanoramaIndex);

  if (!currentLocation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Назад</Text>
          </Pressable>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>Свободное перемещение</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Локации не найдены</Text>
          <Pressable style={styles.backButtonLarge} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonLargeText}>Вернуться назад</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentPanorama = currentLocation.panoramas[currentPanoramaIndex];
  const connections = currentLocation.connections || [];

  const handleNavigateToLocation = (link: NavigationLink) => {
    const targetLocation = ALL_LOCATIONS.find((loc) => loc.id === link.targetLocationId);
    if (targetLocation) {
      setCurrentLocation(targetLocation);
      setCurrentPanoramaIndex(link.targetPanoramaIndex || 0);
    }
  };

  const totalPanoramas = currentLocation.panoramas.length;
  const hasMultiplePanoramas = totalPanoramas > 1;

  const goToPreviousPanorama = () => {
    if (currentPanoramaIndex > 0) {
      setCurrentPanoramaIndex(currentPanoramaIndex - 1);
    }
  };

  const goToNextPanorama = () => {
    if (currentPanoramaIndex < totalPanoramas - 1) {
      setCurrentPanoramaIndex(currentPanoramaIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </Pressable>
        <View style={styles.topBarInfo}>
          <Text style={styles.locationTitle}>{currentLocation.title}</Text>
          {currentLocation.floor && (
            <Text style={styles.floorBadge}>{currentLocation.floor} этаж</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.viewerContainer}>
          <PanoramaViewer imageSource={currentPanorama.url} enableGyroscope />

          {hasMultiplePanoramas && (
            <View style={styles.panoramaControls}>
              <Pressable
                style={[
                  styles.navButton,
                  currentPanoramaIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={goToPreviousPanorama}
                disabled={currentPanoramaIndex === 0}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>

              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                  {currentPanoramaIndex + 1} из {totalPanoramas}
                </Text>
                <Text style={styles.panoramaTitle}>{currentPanorama.title}</Text>
              </View>

              <Pressable
                style={[
                  styles.navButton,
                  currentPanoramaIndex === totalPanoramas - 1 && styles.navButtonDisabled,
                ]}
                onPress={goToNextPanorama}
                disabled={currentPanoramaIndex === totalPanoramas - 1}
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>
          )}
        </View>

        {connections.length > 0 && (
          <View style={styles.connectionsContainer}>
            <Text style={styles.connectionsTitle}>Перейти в:</Text>
            <View style={styles.connectionsGrid}>
              {connections.map((connection, index) => {
                const targetLocation = ALL_LOCATIONS.find(
                  (loc) => loc.id === connection.targetLocationId
                );
                if (!targetLocation) return null;

                return (
                  <Pressable
                    key={index}
                    style={styles.connectionCard}
                    onPress={() => handleNavigateToLocation(connection)}
                  >
                    <View style={styles.connectionIcon}>
                      <Text style={styles.connectionIconText}>
                        {connection.direction === "forward" && "⬆️"}
                        {connection.direction === "backward" && "⬇️"}
                        {connection.direction === "left" && "⬅️"}
                        {connection.direction === "right" && "➡️"}
                        {connection.direction === "up" && "🔼"}
                        {connection.direction === "down" && "🔽"}
                      </Text>
                    </View>
                    <View style={styles.connectionContent}>
                      <Text style={styles.connectionLabel}>
                        {connection.label || targetLocation.title}
                      </Text>
                      <Text style={styles.connectionFloor}>
                        {targetLocation.floor ? `${targetLocation.floor} этаж` : ""}
                      </Text>
                    </View>
                    <Text style={styles.connectionArrow}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.locationInfo}>
          <Text style={styles.description}>{currentLocation.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1437",
  },
  topBar: {
    backgroundColor: "#1E2A4A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3A5C",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    marginBottom: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  topBarInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  floorBadge: {
    color: "#94A3B8",
    fontSize: 13,
    backgroundColor: "#2A3A5C",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  viewerContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  panoramaControls: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(11, 20, 55, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.3)",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(37, 99, 235, 0.3)",
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 28,
  },
  counterContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  panoramaTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },
  connectionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  connectionsTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  connectionsGrid: {
    gap: 12,
  },
  connectionCard: {
    backgroundColor: "#1E2A4A",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A3A5C",
  },
  connectionIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  connectionIconText: {
    fontSize: 24,
  },
  connectionContent: {
    flex: 1,
  },
  connectionLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  connectionFloor: {
    color: "#94A3B8",
    fontSize: 13,
  },
  connectionArrow: {
    color: "#64748B",
    fontSize: 24,
    fontWeight: "300",
  },
  locationInfo: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#94A3B8",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  backButtonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  backButtonLargeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
