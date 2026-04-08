import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PanoramaViewer from "../components/PanoramaViewer";
import { CampusLocation, RootStackParamList } from "../types/navigation";
import { ALL_LOCATIONS } from "../constants/locations";

type PanoramaScreenProps = NativeStackScreenProps<RootStackParamList, "Panorama">;

export default function PanoramaScreen({ route, navigation }: PanoramaScreenProps) {
  const { locationId, location: locationFromParams, initialPanoramaIndex = 0 } = route.params;
  const location = locationFromParams || ALL_LOCATIONS.find((item: CampusLocation) => item.id === locationId);

  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(initialPanoramaIndex);

  if (!location) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Назад</Text>
          </Pressable>
          <Text style={styles.locationTitle}>Локация не найдена</Text>
          <Text style={styles.locationDescription}>
            Проверьте корректность идентификатора локации.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPanoramas = location.panoramas.length;
  const currentPanorama = location.panoramas[currentPanoramaIndex];
  const hasMultiplePanoramas = totalPanoramas > 1;

  const goToPrevious = () => {
    if (currentPanoramaIndex > 0) {
      setCurrentPanoramaIndex(currentPanoramaIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentPanoramaIndex < totalPanoramas - 1) {
      setCurrentPanoramaIndex(currentPanoramaIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </Pressable>
        <Text style={styles.locationTitle}>{location.title}</Text>
        <Text style={styles.locationDescription}>{location.description}</Text>
      </View>

      <View style={styles.viewerContainer}>
        <PanoramaViewer 
          imageSource={currentPanorama.url}
        />

        {hasMultiplePanoramas && (
          <View style={styles.panoramaControls}>
            <Pressable
              style={[styles.navButton, currentPanoramaIndex === 0 && styles.navButtonDisabled]}
              onPress={goToPrevious}
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
              style={[styles.navButton, currentPanoramaIndex === totalPanoramas - 1 && styles.navButtonDisabled]}
              onPress={goToNext}
              disabled={currentPanoramaIndex === totalPanoramas - 1}
            >
              <Text style={styles.navButtonText}>›</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#061331",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 12,
    backgroundColor: "#0B1F4D",
    borderBottomWidth: 1,
    borderBottomColor: "#183A83",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    marginBottom: 8,
  },
  backButtonText: {
    color: "#0B1F4D",
    fontSize: 13,
    fontWeight: "700",
  },
  locationTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  locationDescription: {
    color: "#E2E8F0",
    fontSize: 13,
    marginTop: 4,
  },
  viewerContainer: {
    flex: 1,
  },
  panoramaControls: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(11, 31, 77, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#38BDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(56, 189, 248, 0.3)",
  },
  navButtonText: {
    color: "#0B1F4D",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 32,
  },
  counterContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  panoramaTitle: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "500",
  },
});
