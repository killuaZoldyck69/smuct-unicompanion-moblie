import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Svg, { Rect, Line } from "react-native-svg";
import Toast from "react-native-toast-message";
import { fontFamily } from "../constants";
import type { ParsedHospitalLocation } from "../utils";

interface HospitalDestinationCardProps {
  parsedHospital: ParsedHospitalLocation;
}

const generateHospitalMapHtml = (lat: number, lng: number, shortName: string) => {
  const safeName = (shortName || "Hospital").replace(/["'<>\\]/g, "");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:#edf2f7; overflow:hidden; }
    .custom-callout-wrapper {
      display: flex !important;
      justify-content: center !important;
      align-items: flex-end !important;
      width: 0 !important;
      height: 0 !important;
      position: relative !important;
    }
    .hospital-callout {
      background: #be123c;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(190, 18, 60, 0.45);
      border: 2px solid #ffffff;
      transform: translate(-50%, -100%);
      margin-top: -6px;
      position: absolute;
    }
    .hospital-callout::after {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 7px solid #be123c;
    }
    .leaflet-control-container { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      var map = L.map('map', {
        center: [${lat}, ${lng}],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      var icon = L.divIcon({
        className: 'custom-callout-wrapper',
        html: '<div class="hospital-callout"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg><span>${safeName}</span></div>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
    } catch(e) {}
  </script>
</body>
</html>`;
};

export const HospitalDestinationCard: React.FC<HospitalDestinationCardProps> = ({
  parsedHospital,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const mapHtml = useMemo(
    () =>
      generateHospitalMapHtml(
        parsedHospital.latitude,
        parsedHospital.longitude,
        parsedHospital.shortName,
      ),
    [parsedHospital.latitude, parsedHospital.longitude, parsedHospital.shortName],
  );

  const handleOpenInMaps = useCallback(() => {
    const { name, latitude, longitude } = parsedHospital;
    const cleanName = encodeURIComponent(name || "Hospital");

    // Coordinates-first mapping targets:
    // Android: geo:lat,lng?q=lat,lng(Name)
    // iOS: maps:0,0?q=Name&ll=lat,lng
    // Web: https://www.google.com/maps/search/?api=1&query=lat,lng
    const iosUrl = `maps:0,0?q=${cleanName}&ll=${latitude},${longitude}`;
    const androidUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${cleanName})`;
    const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    const nativeUrl = Platform.select({
      ios: iosUrl,
      android: androidUrl,
      default: googleMapsWebUrl,
    });

    if (nativeUrl) {
      Linking.canOpenURL(nativeUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(nativeUrl);
          } else {
            Linking.openURL(googleMapsWebUrl);
          }
        })
        .catch(() => {
          Linking.openURL(googleMapsWebUrl).catch(() => {
            Toast.show({
              type: "error",
              text1: "Cannot Open Maps",
              text2: "Unable to launch directions to the hospital.",
            });
          });
        });
    } else {
      Linking.openURL(googleMapsWebUrl);
    }
  }, [parsedHospital]);

  return (
    <View style={styles.cardContainer}>
      {/* 1. CARD HEADER */}
      <Text style={styles.destinationTag}>DESTINATION</Text>

      <View style={styles.headerContentRow}>
        <View style={styles.hospitalTitleSection}>
          <View style={styles.pinCircle}>
            <Feather name="map-pin" size={14} color="#e11d48" />
          </View>
          <Text style={styles.hospitalNameText} numberOfLines={2}>
            {parsedHospital.name}
          </Text>
        </View>

        {parsedHospital.roomInfo ? (
          <View style={styles.roomInfoBadge}>
            <Text style={styles.roomInfoText} numberOfLines={1}>
              {parsedHospital.roomInfo}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 2. REAL HOSPITAL LOCATION MAP */}
      <View style={styles.mapCanvas}>
        {!mapError ? (
          <WebView
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={styles.webView}
            scrollEnabled={false}
            pointerEvents="none"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            nestedScrollEnabled={false}
            overScrollMode="never"
            onLoadEnd={() => setMapLoaded(true)}
            onError={() => setMapError(true)}
          />
        ) : (
          /* Offline / Fallback Centered Vector Map Canvas */
          <View style={styles.fallbackCanvas}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 320 180"
              preserveAspectRatio="none"
            >
              <Rect width="320" height="180" rx="16" fill="#edf3f8" />
              <Line x1="0" y1="90" x2="320" y2="90" stroke="#f7fafc" strokeWidth="14" />
              <Line x1="160" y1="0" x2="160" y2="180" stroke="#f7fafc" strokeWidth="14" />
              <Rect x="14" y="14" width="132" height="62" rx="10" fill="#dce5ef" />
              <Rect x="174" y="14" width="132" height="62" rx="10" fill="#dce5ef" />
              <Rect x="14" y="104" width="132" height="62" rx="10" fill="#dce5ef" />
              <Rect x="174" y="104" width="132" height="62" rx="10" fill="#dce5ef" />
            </Svg>

            {/* Centered Hospital Callout Pin */}
            <View style={styles.centerCalloutContainer}>
              <View style={styles.hospitalCalloutBanner}>
                <View style={styles.medicalCrossBox}>
                  <Feather name="plus" size={10} color="#ffffff" />
                </View>
                <Text style={styles.hospitalCalloutText} numberOfLines={1}>
                  {parsedHospital.shortName}
                </Text>
              </View>
              <View style={styles.pointerArrow} />
            </View>
          </View>
        )}

        {/* Loading Indicator while Leaflet tiles stream in */}
        {!mapLoaded && !mapError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#be123c" />
          </View>
        )}

        {/* Tap overlay: tapping anywhere on the map opens native Google Maps / Apple Maps */}
        <TouchableOpacity
          style={styles.mapTapOverlay}
          onPress={handleOpenInMaps}
          activeOpacity={0.92}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Hospital location for ${parsedHospital.name}. Tap to view in Maps.`}
        />
      </View>

      {/* 3. CARD BOTTOM BAR: AREA LOCATION & OPEN IN MAPS BUTTON */}
      <View style={styles.bottomBar}>
        <View style={styles.locationAreaContainer}>
          <Feather
            name="map-pin"
            size={13}
            color="#be123c"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.locationAreaText} numberOfLines={1}>
            {parsedHospital.area || "Dhaka, Bangladesh"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.openInMapsBtn}
          onPress={handleOpenInMaps}
          activeOpacity={0.84}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open hospital location in Maps"
        >
          <Text style={styles.openInMapsText}>Open in Maps</Text>
          <Feather
            name="arrow-up-right"
            size={13.5}
            color="#1d4ed8"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.07)",
    padding: 16,
    marginTop: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  destinationTag: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hospitalTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  hospitalNameText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    letterSpacing: -0.2,
  },
  roomInfoBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9.5,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roomInfoText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  mapCanvas: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    position: "relative",
    backgroundColor: "#edf3f8",
  },
  webView: {
    width: "100%",
    height: "100%",
    backgroundColor: "#edf3f8",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf3f8",
  },
  fallbackCanvas: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  centerCalloutContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -60 }, { translateY: -22 }],
    alignItems: "center",
  },
  hospitalCalloutBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#be123c",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#be123c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.2,
    borderColor: "#ffffff",
  },
  medicalCrossBox: {
    width: 13,
    height: 13,
    borderRadius: 2.5,
    borderWidth: 1.2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  hospitalCalloutText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.1,
  },
  pointerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#be123c",
    marginTop: -0.5,
  },
  mapTapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  locationAreaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  locationAreaText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: -0.1,
  },
  openInMapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12.5,
    paddingVertical: 7.5,
    borderRadius: 16,
  },
  openInMapsText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
    letterSpacing: -0.1,
  },
  arrowIcon: {
    marginLeft: 3,
  },
});
