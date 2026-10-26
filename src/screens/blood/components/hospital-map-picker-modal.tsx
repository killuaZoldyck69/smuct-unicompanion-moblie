import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import {
  BENTO_COLORS,
  fontFamily,
  HospitalLocationItem,
  POPULAR_HOSPITALS,
} from "../constants";

export interface SelectedHospitalLocation {
  name: string;
  area?: string;
  address?: string;
  latitude: number;
  longitude: number;
}

interface HospitalMapPickerModalProps {
  visible: boolean;
  initialHospitalName?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onSelectHospital: (hospital: SelectedHospitalLocation) => void;
  onClose: () => void;
}

interface SearchResultItem {
  name: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  isHospital?: boolean;
}

// Browser User-Agent string to satisfy Nominatim usage policy without getting blocked
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Calculate distance in meters between two coordinates
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate the Leaflet HTML string
const generateMapHtml = (
  hospitals: HospitalLocationItem[],
  initialLat: number,
  initialLng: number,
  initialName: string,
) => {
  const hospitalsJson = JSON.stringify(hospitals);
  const safeInitialName = JSON.stringify(initialName);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-hospital-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      background: #be123c;
      color: #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(190, 18, 60, 0.4);
      border: 2.5px solid #ffffff;
    }
    .custom-hospital-pin svg {
      transform: rotate(45deg);
      width: 17px;
      height: 17px;
      fill: #ffffff;
    }
    .selected-pin {
      background: #131b2e !important;
      box-shadow: 0 6px 16px rgba(19, 27, 46, 0.5) !important;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: rotate(-45deg) scale(1); }
      50% { transform: rotate(-45deg) scale(1.18); }
      100% { transform: rotate(-45deg) scale(1); }
    }
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      padding: 4px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    }
    .leaflet-popup-content {
      font-size: 13px;
      font-weight: 700;
      color: #131b2e;
      line-height: 1.35;
      margin: 8px 10px;
    }
    .popup-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const hospitals = ${hospitalsJson};
    let currentLat = ${initialLat};
    let currentLng = ${initialLng};
    let currentName = ${safeInitialName};

    const map = L.map('map', {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    function createPinIcon(isSelected) {
      const pinClass = isSelected ? 'custom-hospital-pin selected-pin' : 'custom-hospital-pin';
      return L.divIcon({
        className: 'custom-pin-container',
        html: '<div class="' + pinClass + '"><svg viewBox="0 0 24 24"><path d="M19 10.5V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4.5A5.5 5.5 0 0 0 10.5 16h3A5.5 5.5 0 0 0 19 10.5zM11 6h2v3h3v2h-3v3h-2v-3H8V9h3V6z"/></svg></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });
    }

    let activeMarker = null;

    // Place predefined hospital markers
    hospitals.forEach(function(h) {
      const isInitial = h.name === currentName || (Math.abs(h.latitude - currentLat) < 0.0001 && Math.abs(h.longitude - currentLng) < 0.0001);
      const marker = L.marker([h.latitude, h.longitude], {
        icon: createPinIcon(isInitial)
      }).addTo(map);

      marker.bindPopup('<div>' + h.name + '</div><div class="popup-sub">' + h.area + '</div>');

      if (isInitial) {
        activeMarker = marker;
        marker.openPopup();
      }

      marker.on('click', function() {
        if (activeMarker && activeMarker !== marker) {
          activeMarker.setIcon(createPinIcon(false));
        }
        marker.setIcon(createPinIcon(true));
        activeMarker = marker;
        map.flyTo([h.latitude, h.longitude], 16, { duration: 0.8 });

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SELECT_HOSPITAL',
            name: h.name,
            area: h.area,
            address: h.address,
            latitude: h.latitude,
            longitude: h.longitude
          }));
        }
      });
    });

    // If initial location was custom and not matching predefined hospitals
    if (!activeMarker) {
      activeMarker = L.marker([currentLat, currentLng], {
        icon: createPinIcon(true)
      }).addTo(map);
      activeMarker.bindPopup('<div>' + currentName + '</div><div class="popup-sub">Selected location</div>').openPopup();
    }

    // Map tap/click listener for custom locations
    map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (activeMarker) {
        activeMarker.setLatLng([lat, lng]);
        activeMarker.setIcon(createPinIcon(true));
      } else {
        activeMarker = L.marker([lat, lng], { icon: createPinIcon(true) }).addTo(map);
      }

      activeMarker.bindPopup('<div style="font-weight:700;">Finding location name...</div><div class="popup-sub">Please wait</div>').openPopup();

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MAP_TAP',
          latitude: lat,
          longitude: lng
        }));
      }
    });

    // Function to pan to specific hospital from React Native
    window.panToHospital = function(name, lat, lng, area) {
      if (activeMarker) {
        activeMarker.setLatLng([lat, lng]);
        activeMarker.setIcon(createPinIcon(true));
      } else {
        activeMarker = L.marker([lat, lng], { icon: createPinIcon(true) }).addTo(map);
      }
      activeMarker.bindPopup('<div>' + name + '</div><div class="popup-sub">' + (area || '') + '</div>').openPopup();
      map.flyTo([lat, lng], 16, { duration: 0.8 });
    };

    // Update marker popup text when location name is resolved
    window.updateMarkerLocationName = function(name, area) {
      if (activeMarker) {
        activeMarker.bindPopup('<div>' + name + '</div><div class="popup-sub">' + (area || '') + '</div>').openPopup();
      }
    };

    window.zoomIn = function() { map.zoomIn(); };
    window.zoomOut = function() { map.zoomOut(); };
    window.recenterMap = function(lat, lng) { map.flyTo([lat, lng], 15, { duration: 0.8 }); };

    setTimeout(function() {
      map.invalidateSize();
    }, 300);
  </script>
</body>
</html>
  `;
};

export const HospitalMapPickerModal = React.memo(function HospitalMapPickerModal({
  visible,
  initialHospitalName,
  initialLatitude,
  initialLongitude,
  onSelectHospital,
  onClose,
}: HospitalMapPickerModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  // Editable name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  // Online search results
  const [onlineResults, setOnlineResults] = useState<SearchResultItem[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Default coordinate: Uttara Sector 9
  const defaultHospital = POPULAR_HOSPITALS[0];
  const [selectedHospital, setSelectedHospital] = useState<SelectedHospitalLocation>(() => {
    return {
      name: initialHospitalName || defaultHospital.name,
      area: defaultHospital.area,
      address: defaultHospital.address,
      latitude: initialLatitude || defaultHospital.latitude,
      longitude: initialLongitude || defaultHospital.longitude,
    };
  });

  // Filtered popular hospitals matching the search query
  const localMatches = useMemo<SearchResultItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return POPULAR_HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q),
    ).map((h) => ({
      name: h.name,
      area: h.area,
      address: h.address,
      latitude: h.latitude,
      longitude: h.longitude,
      isHospital: true,
    }));
  }, [searchQuery]);

  // Combined search results: local pre-filled hospitals + online OSM search results
  const combinedSearchResults = useMemo<SearchResultItem[]>(() => {
    const localNames = new Set(localMatches.map((m) => m.name.toLowerCase()));
    const filteredOnline = onlineResults.filter(
      (o) => !localNames.has(o.name.toLowerCase()),
    );
    return [...localMatches, ...filteredOnline];
  }, [localMatches, onlineResults]);

  // Execute online search against OpenStreetMap Nominatim
  const executeOnlineSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (q.length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    setIsSearchingOnline(true);
    try {
      // Query OpenStreetMap Nominatim for Bangladesh with clean query
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q,
      )}&countrycodes=bd&limit=7&accept-language=en`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data: any[] = await res.json();
        const parsed: SearchResultItem[] = data.map((item) => {
          const parts = (item.display_name || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(
              (s: string) =>
                !["Bangladesh", "Dhaka Division", "Dhaka District"].includes(s),
            );

          const primaryName = item.name || parts[0] || "Location";
          const area = parts.length > 1 ? parts.slice(1, 3).join(", ") : "Dhaka";
          const isHospital =
            item.category === "amenity" ||
            item.type === "hospital" ||
            item.type === "clinic" ||
            primaryName.toLowerCase().includes("hospital") ||
            primaryName.toLowerCase().includes("medical") ||
            primaryName.toLowerCase().includes("clinic");

          return {
            name: primaryName,
            area,
            address: parts.join(", "),
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            isHospital,
          };
        });

        setOnlineResults(parsed);
      }
    } catch (err) {
      console.warn("Online search error:", err);
    } finally {
      setIsSearchingOnline(false);
    }
  }, []);

  // Debounced search trigger when typing
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(() => {
      executeOnlineSearch(q);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, executeOnlineSearch]);

  // Reverse geocode latitude and longitude to get the EXACT location name
  const resolveExactLocation = useCallback(async (lat: number, lng: number) => {
    setIsResolvingLocation(true);

    // 1. Check if point is within 250m of a known popular hospital
    for (const h of POPULAR_HOSPITALS) {
      const dist = getDistanceInMeters(lat, lng, h.latitude, h.longitude);
      if (dist <= 250) {
        setSelectedHospital({
          name: h.name,
          area: h.area,
          address: h.address,
          latitude: h.latitude,
          longitude: h.longitude,
        });
        setIsResolvingLocation(false);

        const safeName = JSON.stringify(h.name);
        const safeArea = JSON.stringify(h.area);
        webViewRef.current?.injectJavaScript(
          `window.updateMarkerLocationName && window.updateMarkerLocationName(${safeName}, ${safeArea}); true;`,
        );
        return;
      }
    }

    // 2. Query Nominatim with high zoom (zoom=18) and English address details
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        // Extract specific place name or medical facility
        const specificPlace =
          data.name ||
          addr.hospital ||
          addr.clinic ||
          addr.doctors ||
          addr.health_post ||
          addr.pharmacy ||
          addr.amenity ||
          addr.building ||
          addr.office ||
          addr.school ||
          addr.college ||
          addr.university;

        const road = addr.road || addr.pedestrian || addr.footway;
        const houseNumber = addr.house_number;
        const quarter =
          addr.quarter || addr.suburb || addr.neighbourhood || addr.city_district;
        const city = addr.city || addr.town || addr.county || "Dhaka";

        let exactLocationName = "";
        if (specificPlace && specificPlace !== road) {
          exactLocationName = quarter ? `${specificPlace}, ${quarter}` : specificPlace;
        } else if (houseNumber && road && quarter) {
          exactLocationName = `${houseNumber}, ${road}, ${quarter}`;
        } else if (road && quarter) {
          exactLocationName = `${road}, ${quarter}`;
        } else if (road) {
          exactLocationName = `${road}, ${city}`;
        } else if (quarter) {
          exactLocationName = `${quarter}, ${city}`;
        } else {
          // Extract first 2 clean segments of display_name
          const segments = (data.display_name || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(
              (s: string) =>
                ![
                  "Bangladesh",
                  "Dhaka Division",
                  "Dhaka District",
                  "Dhaka Metropolitan",
                ].includes(s),
            );
          exactLocationName = segments.slice(0, 2).join(", ") || `Location in ${city}`;
        }

        const cleanAddress = [
          houseNumber,
          road,
          quarter,
          addr.suburb && addr.suburb !== quarter ? addr.suburb : null,
          city,
          addr.postcode,
        ]
          .filter(Boolean)
          .join(", ");

        const resolvedArea = quarter || city;

        setSelectedHospital({
          name: exactLocationName,
          area: resolvedArea,
          address: cleanAddress || data.display_name || "Location confirmed on map",
          latitude: lat,
          longitude: lng,
        });

        const safeName = JSON.stringify(exactLocationName);
        const safeArea = JSON.stringify(resolvedArea);
        webViewRef.current?.injectJavaScript(
          `window.updateMarkerLocationName && window.updateMarkerLocationName(${safeName}, ${safeArea}); true;`,
        );
        setIsResolvingLocation(false);
        return;
      }
    } catch (err) {
      console.warn("Nominatim reverse geocode error", err);
    }

    // 3. Fallback: BigDataCloud Reverse Geocode
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl);
      if (bdcRes.ok) {
        const bdc = await bdcRes.json();
        const locality = bdc.locality || bdc.city || "Uttara";
        const exactName = `${locality}, Dhaka`;
        const address = `${locality}, Dhaka, Bangladesh`;

        setSelectedHospital({
          name: exactName,
          area: locality,
          address,
          latitude: lat,
          longitude: lng,
        });

        const safeName = JSON.stringify(exactName);
        const safeArea = JSON.stringify(locality);
        webViewRef.current?.injectJavaScript(
          `window.updateMarkerLocationName && window.updateMarkerLocationName(${safeName}, ${safeArea}); true;`,
        );
        setIsResolvingLocation(false);
        return;
      }
    } catch (e) {
      console.warn("BigDataCloud fallback error", e);
    }

    // 4. Default Clean Fallback
    const fallbackName = "Selected Hospital Location, Uttara";
    setSelectedHospital({
      name: fallbackName,
      area: "Uttara",
      address: "Uttara, Dhaka",
      latitude: lat,
      longitude: lng,
    });
    setIsResolvingLocation(false);
  }, []);

  // Handle messages sent from the Leaflet WebView
  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "SELECT_HOSPITAL") {
          setSelectedHospital({
            name: data.name,
            area: data.area,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
          });
          setIsEditingName(false);
          setIsSearchOpen(false);
          Keyboard.dismiss();
        } else if (data.type === "MAP_TAP") {
          setIsSearchOpen(false);
          setIsEditingName(false);
          Keyboard.dismiss();
          resolveExactLocation(data.latitude, data.longitude);
        }
      } catch {
        // Ignore parse errors
      }
    },
    [resolveExactLocation],
  );

  // When selecting an item from the search results dropdown or quick chips
  const handleSelectSearchResult = useCallback((item: SearchResultItem | HospitalLocationItem) => {
    setSelectedHospital({
      name: item.name,
      area: item.area,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
    });

    setSearchQuery(item.name);
    setIsSearchOpen(false);
    setIsEditingName(false);
    Keyboard.dismiss();

    const safeName = JSON.stringify(item.name);
    const safeArea = JSON.stringify(item.area);
    webViewRef.current?.injectJavaScript(
      `window.panToHospital && window.panToHospital(${safeName}, ${item.latitude}, ${item.longitude}, ${safeArea}); true;`,
    );
  }, []);

  // Recenter to Uttara / SMUCT Campus area
  const handleRecenterUttara = useCallback(() => {
    const defaultItem = POPULAR_HOSPITALS[0];
    handleSelectSearchResult(defaultItem);
  }, [handleSelectSearchResult]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    webViewRef.current?.injectJavaScript("window.zoomIn && window.zoomIn(); true;");
  }, []);

  const handleZoomOut = useCallback(() => {
    webViewRef.current?.injectJavaScript("window.zoomOut && window.zoomOut(); true;");
  }, []);

  // Confirm selection
  const handleConfirm = useCallback(() => {
    onSelectHospital(selectedHospital);
    onClose();
  }, [selectedHospital, onSelectHospital, onClose]);

  // Save custom edited name
  const handleSaveCustomName = useCallback(() => {
    const trimmed = editedName.trim();
    if (trimmed) {
      setSelectedHospital((prev) => ({
        ...prev,
        name: trimmed,
      }));
      const safeName = JSON.stringify(trimmed);
      const safeArea = JSON.stringify(selectedHospital.area || "");
      webViewRef.current?.injectJavaScript(
        `window.updateMarkerLocationName && window.updateMarkerLocationName(${safeName}, ${safeArea}); true;`,
      );
    }
    setIsEditingName(false);
    Keyboard.dismiss();
  }, [editedName, selectedHospital.area]);

  // Clear search input
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setOnlineResults([]);
    setIsSearchOpen(false);
  }, []);

  const htmlContent = useMemo(() => {
    return generateMapHtml(
      POPULAR_HOSPITALS,
      selectedHospital.latitude,
      selectedHospital.longitude,
      selectedHospital.name,
    );
  }, [selectedHospital.latitude, selectedHospital.longitude, selectedHospital.name]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Back to form"
          >
            <Feather name="arrow-left" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Select Hospital Location</Text>
            <Text style={styles.headerSubtitle}>Tap pin on map or search hospital by name</Text>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close map"
          >
            <Feather name="x" size={18} color={BENTO_COLORS.subtleText} />
          </TouchableOpacity>
        </View>

        {/* Search Bar Container with Floating Dropdown */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Feather
              name="search"
              size={16}
              color={BENTO_COLORS.subtleText}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hospital or area (e.g. Uttara, Evercare, DMCH)..."
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              returnKeyType="search"
              onSubmitEditing={() => executeOnlineSearch(searchQuery)}
              accessible={true}
              accessibilityLabel="Search hospital name or area"
            />
            {isSearchingOnline && (
              <ActivityIndicator
                size="small"
                color={BENTO_COLORS.crimson}
                style={{ marginRight: 6 }}
              />
            )}
            {searchQuery.length > 0 && !isSearchingOnline && (
              <TouchableOpacity onPress={handleClearSearch} style={{ padding: 4 }}>
                <Feather name="x-circle" size={16} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Prominent Floating Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <View style={styles.searchDropdownCard}>
              <View style={styles.dropdownHeaderRow}>
                <Text style={styles.dropdownHeaderText}>
                  {combinedSearchResults.length > 0
                    ? `MATCHING LOCATIONS (${combinedSearchResults.length})`
                    : isSearchingOnline
                    ? "SEARCHING HOSPITALS..."
                    : "NO MATCHING HOSPITALS FOUND"}
                </Text>
                <TouchableOpacity onPress={() => setIsSearchOpen(false)} style={{ padding: 2 }}>
                  <Text style={styles.dropdownCloseText}>Close</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={combinedSearchResults}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                keyboardShouldPersistTaps="handled"
                style={styles.dropdownList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelectSearchResult(item)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.dropdownItemIconCircle,
                        item.isHospital && styles.dropdownItemIconCircleHospital,
                      ]}
                    >
                      <Feather
                        name={item.isHospital ? "plus-circle" : "map-pin"}
                        size={15}
                        color={item.isHospital ? BENTO_COLORS.crimson : BENTO_COLORS.deepNavy}
                      />
                    </View>
                    <View style={styles.dropdownItemTextWrap}>
                      <Text style={styles.dropdownItemTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.dropdownItemSubtitle} numberOfLines={1}>
                        {item.address || item.area}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={15} color="#cbd5e1" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  !isSearchingOnline ? (
                    <View style={styles.dropdownEmptyWrap}>
                      <Text style={styles.dropdownEmptyText}>
                        No hospital found matching "{searchQuery}". You can tap anywhere on the map or type a custom name below.
                      </Text>
                    </View>
                  ) : null
                }
              />
            </View>
          )}
        </View>

        {/* Quick Popular Hospitals Chips */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {POPULAR_HOSPITALS.map((h, idx) => {
              const isSelected = selectedHospital.name === h.name;
              return (
                <TouchableOpacity
                  key={`${h.name}-${idx}`}
                  style={[styles.hospitalChip, isSelected && styles.hospitalChipActive]}
                  onPress={() => handleSelectSearchResult(h)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${h.name}`}
                >
                  <Feather
                    name="map-pin"
                    size={11}
                    color={isSelected ? "#ffffff" : BENTO_COLORS.crimson}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[styles.hospitalChipText, isSelected && styles.hospitalChipTextActive]}
                    numberOfLines={1}
                  >
                    {h.name.replace(" Hospital", "")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Interactive Leaflet Map Area */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
            onLoadStart={() => setIsLoadingMap(true)}
            onLoadEnd={() => setIsLoadingMap(false)}
            mixedContentMode="always"
            allowFileAccess={true}
          />

          {isLoadingMap && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={BENTO_COLORS.crimson} />
              <Text style={styles.mapLoadingText}>Loading Campus Map...</Text>
            </View>
          )}

          {/* Floating Action Controls */}
          <View style={styles.floatingControls}>
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={handleRecenterUttara}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Center on Uttara SMUCT"
            >
              <Feather name="compass" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={handleZoomIn}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
            >
              <Feather name="plus" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={handleZoomOut}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
            >
              <Feather name="minus" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Confirmation Card */}
        <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.selectedRow}>
            <View style={styles.selectedIconCircle}>
              <Feather name="map-pin" size={18} color={BENTO_COLORS.crimson} />
            </View>
            <View style={styles.selectedTextWrap}>
              <View style={styles.labelWithEditRow}>
                <Text style={styles.selectedHospitalLabel}>CONFIRMED HOSPITAL LOCATION</Text>
                {!isResolvingLocation && !isEditingName && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditedName(selectedHospital.name);
                      setIsEditingName(true);
                    }}
                    style={styles.editNameBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={11} color={BENTO_COLORS.crimson} style={{ marginRight: 3 }} />
                    <Text style={styles.editNameBtnText}>Edit Name</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isResolvingLocation ? (
                <View style={styles.resolvingRow}>
                  <ActivityIndicator size="small" color={BENTO_COLORS.crimson} />
                  <Text style={styles.resolvingText}>Finding exact location name...</Text>
                </View>
              ) : isEditingName ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    style={styles.editNameInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Enter hospital or clinic name..."
                    placeholderTextColor={BENTO_COLORS.subtleText}
                    autoFocus={true}
                    selectTextOnFocus={true}
                  />
                  <TouchableOpacity onPress={handleSaveCustomName} style={styles.saveNameBtn}>
                    <Feather name="check" size={15} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.cancelNameBtn}>
                    <Feather name="x" size={15} color={BENTO_COLORS.subtleText} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.selectedHospitalName} numberOfLines={2}>
                  {selectedHospital.name}
                </Text>
              )}

              <Text style={styles.selectedHospitalAddress} numberOfLines={2}>
                {selectedHospital.address || selectedHospital.area || "Location confirmed on map"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, isResolvingLocation && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isResolvingLocation}
            activeOpacity={0.88}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Confirm hospital location"
          >
            <Feather name="check" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.confirmBtnText}>Confirm Hospital Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: BENTO_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: BENTO_COLORS.white,
    position: "relative",
    zIndex: 999,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13.5,
    color: BENTO_COLORS.neutralText,
    paddingVertical: 0,
    height: "100%",
  },
  searchDropdownCard: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: 280,
    overflow: "hidden",
    zIndex: 9999,
  },
  dropdownHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  dropdownHeaderText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  dropdownCloseText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
  dropdownList: {
    maxHeight: 230,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
  },
  dropdownItemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownItemIconCircleHospital: {
    backgroundColor: "rgba(225, 29, 72, 0.08)",
  },
  dropdownItemTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  dropdownItemTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  dropdownItemSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  dropdownEmptyWrap: {
    padding: 16,
    alignItems: "center",
  },
  dropdownEmptyText: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 17,
  },
  chipsContainer: {
    backgroundColor: BENTO_COLORS.white,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hospitalChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  hospitalChipActive: {
    backgroundColor: BENTO_COLORS.crimson,
    borderColor: BENTO_COLORS.crimson,
  },
  hospitalChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  hospitalChipTextActive: {
    color: "#ffffff",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#e2e8f0",
  },
  webView: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  mapLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(247, 249, 251, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mapLoadingText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  floatingControls: {
    position: "absolute",
    right: 16,
    top: 16,
    gap: 8,
  },
  floatingBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  bottomCard: {
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  selectedIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(225, 29, 72, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.15)",
  },
  selectedTextWrap: {
    flex: 1,
  },
  labelWithEditRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  selectedHospitalLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
    letterSpacing: 0.6,
  },
  editNameBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(225, 29, 72, 0.08)",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  editNameBtnText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
  resolvingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  resolvingText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.crimson,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 4,
  },
  editNameInput: {
    flex: 1,
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO_COLORS.crimson,
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 38,
  },
  saveNameBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BENTO_COLORS.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelNameBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedHospitalName: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 19,
  },
  selectedHospitalAddress: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
    lineHeight: 16,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.crimson,
    height: 50,
    borderRadius: 25,
    shadowColor: BENTO_COLORS.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
});
