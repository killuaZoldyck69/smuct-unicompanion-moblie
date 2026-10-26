import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { WebView, WebViewMessageEvent } from "react-native-webview";
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
    
    .pin-anchor-container {
      position: relative !important;
      width: 34px !important;
      height: 34px !important;
    }
    
    /* Radar pulsing ring centered at exact ground coordinate (17px, 34px) */
    .pin-ground-pulse {
      position: absolute;
      left: 17px;
      top: 34px;
      width: 18px;
      height: 18px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(190, 18, 60, 0.45);
      animation: pulse-ring 2s ease-out infinite;
      pointer-events: none;
      z-index: 1;
    }
    .pin-ground-dot {
      position: absolute;
      left: 17px;
      top: 34px;
      width: 6px;
      height: 6px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #be123c;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 2;
    }
    
    @keyframes pulse-ring {
      0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.95; }
      100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
    }

    /* Teardrop Pin touching the exact ground coordinate */
    .hospital-pin-marker {
      position: absolute;
      top: 0;
      left: 0;
      width: 34px;
      height: 34px;
      background: #be123c;
      color: #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 14px rgba(190, 18, 60, 0.5);
      border: 2.5px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 5;
    }
    .hospital-pin-marker svg {
      transform: rotate(45deg);
      width: 17px;
      height: 17px;
      fill: #ffffff;
    }

    /* Floating Hospital Callout Pill centered directly above the pin */
    .hospital-floating-callout {
      position: absolute;
      bottom: 44px;
      left: 17px;
      transform: translateX(-50%);
      background: #be123c;
      color: #ffffff;
      padding: 5px 12px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 11.5px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(190, 18, 60, 0.4);
      border: 2px solid #ffffff;
      cursor: pointer;
      z-index: 10;
    }
    .hospital-floating-callout::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #be123c;
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
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      window.map = map;

      var icon = L.divIcon({
        className: 'pin-anchor-container',
        html: '<div class="pin-ground-pulse"></div>' +
              '<div class="pin-ground-dot"></div>' +
              '<div class="hospital-pin-marker">' +
                '<svg viewBox="0 0 24 24"><path d="M19 10.5V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4.5A5.5 5.5 0 0 0 10.5 16h3A5.5 5.5 0 0 0 19 10.5zM11 6h2v3h3v2h-3v3h-2v-3H8V9h3V6z"/></svg>' +
              '</div>' +
              '<div class="hospital-floating-callout">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>' +
                '<span>${safeName}</span>' +
              '</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });
      var marker = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);

      marker.on('click', function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_TAP' }));
        }
      });

      window.zoomIn = function() {
        if (window.map) window.map.zoomIn();
      };
      window.zoomOut = function() {
        if (window.map) window.map.zoomOut();
      };
      window.recenterMap = function() {
        if (window.map) {
          window.map.flyTo([${lat}, ${lng}], 16, { animate: true, duration: 0.7 });
        }
      };
      window.panMap = function(dx, dy) {
        if (window.map) {
          window.map.panBy([dx, dy], { animate: true, duration: 0.35 });
        }
      };
    } catch(e) {}
  </script>
</body>
</html>`;
};

export const HospitalDestinationCard: React.FC<HospitalDestinationCardProps> = ({
  parsedHospital,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isMovePadVisible, setIsMovePadVisible] = useState(false);

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

  const handleZoomIn = useCallback(() => {
    webViewRef.current?.injectJavaScript("window.zoomIn && window.zoomIn(); true;");
  }, []);

  const handleZoomOut = useCallback(() => {
    webViewRef.current?.injectJavaScript("window.zoomOut && window.zoomOut(); true;");
  }, []);

  const handleRecenter = useCallback(() => {
    webViewRef.current?.injectJavaScript("window.recenterMap && window.recenterMap(); true;");
  }, []);

  const handlePan = useCallback((dx: number, dy: number) => {
    webViewRef.current?.injectJavaScript(`window.panMap && window.panMap(${dx}, ${dy}); true;`);
  }, []);

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.type === "MARKER_TAP") {
          handleOpenInMaps();
        }
      } catch {}
    },
    [handleOpenInMaps],
  );

  return (
    <View style={styles.cardContainer}>
      {/* 1. CARD HEADER: HOSPITAL FULL NAME WITH FULL ADDRESS */}
      <Text style={styles.destinationTag}>DESTINATION</Text>

      <View style={styles.headerContentRow}>
        <View style={styles.hospitalTitleSection}>
          <View style={styles.pinCircle}>
            <Feather name="map-pin" size={15} color="#e11d48" />
          </View>
          <View style={styles.hospitalDetailsBlock}>
            <Text style={styles.hospitalNameText} numberOfLines={2}>
              {parsedHospital.name}
            </Text>
            <Text style={styles.hospitalAddressText} numberOfLines={4}>
              {parsedHospital.address || parsedHospital.area || "Dhaka, Bangladesh"}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. INTERACTIVE HOSPITAL LOCATION MAP */}
      <View style={styles.mapCanvas}>
        {!mapError ? (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={styles.webView}
            scrollEnabled={false}
            pointerEvents="auto"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            nestedScrollEnabled={false}
            overScrollMode="never"
            onMessage={handleWebViewMessage}
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

        {/* Floating Zoom & Move Action Column (Top Right) */}
        {mapLoaded && !mapError && (
          <View style={styles.floatingControls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleZoomIn}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Zoom in map"
            >
              <Feather name="plus" size={16} color="#1e293b" />
            </TouchableOpacity>

            <View style={styles.controlDivider} />

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleZoomOut}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Zoom out map"
            >
              <Feather name="minus" size={16} color="#1e293b" />
            </TouchableOpacity>

            <View style={styles.controlDivider} />

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleRecenter}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Recenter map on hospital"
            >
              <Feather name="crosshair" size={15} color="#be123c" />
            </TouchableOpacity>

            <View style={styles.controlDivider} />

            <TouchableOpacity
              style={[
                styles.controlBtn,
                isMovePadVisible && styles.controlBtnActive,
              ]}
              onPress={() => setIsMovePadVisible((prev) => !prev)}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isMovePadVisible
                  ? "Hide directional move controls"
                  : "Show directional move controls"
              }
            >
              <Feather
                name="move"
                size={14}
                color={isMovePadVisible ? "#2563eb" : "#475569"}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Compact Floating Directional Pad (Bottom Left) */}
        {mapLoaded && !mapError && isMovePadVisible && (
          <View style={styles.compactDpadContainer}>
            <TouchableOpacity
              style={styles.dpadCloseBadge}
              onPress={() => setIsMovePadVisible(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close pan controls"
            >
              <Feather name="x" size={9} color="#ffffff" />
            </TouchableOpacity>

            {/* Row 1: UP */}
            <TouchableOpacity
              style={styles.dpadArrowBtn}
              onPress={() => handlePan(0, -75)}
              activeOpacity={0.65}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Pan map up"
            >
              <Feather name="chevron-up" size={15} color="#1e293b" />
            </TouchableOpacity>

            {/* Row 2: LEFT, CENTER (RECENTER), RIGHT */}
            <View style={styles.dpadMiddleRow}>
              <TouchableOpacity
                style={styles.dpadArrowBtn}
                onPress={() => handlePan(-75, 0)}
                activeOpacity={0.65}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Pan map left"
              >
                <Feather name="chevron-left" size={15} color="#1e293b" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dpadCenterBtn}
                onPress={handleRecenter}
                activeOpacity={0.65}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Recenter map on hospital"
              >
                <Feather name="crosshair" size={12} color="#be123c" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dpadArrowBtn}
                onPress={() => handlePan(75, 0)}
                activeOpacity={0.65}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Pan map right"
              >
                <Feather name="chevron-right" size={15} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {/* Row 3: DOWN */}
            <TouchableOpacity
              style={styles.dpadArrowBtn}
              onPress={() => handlePan(0, 75)}
              activeOpacity={0.65}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Pan map down"
            >
              <Feather name="chevron-down" size={15} color="#1e293b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Move Helper Pill (Bottom Left when D-pad is closed) */}
        {mapLoaded && !mapError && !isMovePadVisible && (
          <TouchableOpacity
            style={styles.movePillBadge}
            onPress={() => setIsMovePadVisible(true)}
            activeOpacity={0.82}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open map move controls"
          >
            <Feather name="move" size={10.5} color="#2563eb" style={{ marginRight: 4 }} />
            <Text style={styles.movePillText}>Pan / Move</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. CARD BOTTOM BAR: ROOM/WARD/BED NUMBER & OPEN IN MAPS BUTTON */}
      <View style={styles.bottomBar}>
        <View style={styles.locationAreaContainer}>
          <Feather
            name="layers"
            size={13.5}
            color="#be123c"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.locationAreaText} numberOfLines={1}>
            {parsedHospital.roomInfo || "Emergency Ward / Bed"}
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
    alignItems: "flex-start",
    flex: 1,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  hospitalDetailsBlock: {
    flex: 1,
  },
  hospitalNameText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  hospitalAddressText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
    letterSpacing: -0.1,
    lineHeight: 16,
  },
  mapCanvas: {
    width: "100%",
    height: 210,
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
  floatingControls: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  controlBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  controlBtnActive: {
    backgroundColor: "#eff6ff",
  },
  controlDivider: {
    height: 1,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    width: "70%",
    alignSelf: "center",
  },
  compactDpadContainer: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 94,
    height: 94,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.09)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  dpadCloseBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    zIndex: 10,
  },
  dpadArrowBtn: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
  },
  dpadMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginVertical: 2,
  },
  dpadCenterBtn: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.18)",
  },
  movePillBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 9.5,
    paddingVertical: 5.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  movePillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#2563eb",
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
