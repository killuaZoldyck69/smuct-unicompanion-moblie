import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import {
  useBusSchedules,
  useCreateBusRoute,
  useDeleteBusRoute,
} from "@/features/schedule/useSchedule";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export default function AdminBusManageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    route: "",
    busNumber: "",
    departureTime: "",
    stops: "",
  });

  // Fetch Existing using Feature Hook
  const { data: schedules, isLoading } = useBusSchedules();
  const createMutation = useCreateBusRoute();
  const deleteMutation = useDeleteBusRoute();

  const handleDelete = (id: string, route: string) => {
    if (Platform.OS === "web") {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Route Removed" });
        },
      });
      return;
    }

    Alert.alert(
      "Delete Route",
      `Are you sure you want to delete the route "${route}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteMutation.mutate(id, {
              onSuccess: () => {
                Toast.show({ type: "success", text1: "Route Removed" });
              },
            }),
        },
      ]
    );
  };

  const handleAddRoute = async () => {
    if (!formData.route.trim() || !formData.departureTime.trim()) {
      Toast.show({
        type: "error",
        text1: "Required Fields Missing",
        text2: "Route and Departure Time are mandatory.",
      });
      return;
    }

    const payload = {
      routeName: formData.route.trim(),
      startPoint: formData.route.trim(),
      endPoint: formData.route.trim(),
      busNumber: formData.busNumber.trim() || "N/A",
      departureTime: formData.departureTime.trim(),
      stops: formData.stops
        ? formData.stops
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "")
        : [],
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Route Added!" });
        setFormData({ route: "", busNumber: "", departureTime: "", stops: "" });
      },
      onError: (error: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to add",
          text2: error.message,
        });
      },
    });
  };

  const renderInput = (
    label: string,
    key: keyof typeof formData,
    icon: any,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather
          name={icon}
          size={16}
          color={BENTO_COLORS.subtleText}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={placeholder}
          placeholderTextColor={BENTO_COLORS.subtleText}
          accessible={true}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Manage Routes</Text>
          <Text style={styles.screenSubtitle}>Add or remove bus schedules</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 40 : 56 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ADD NEW SCHEDULE */}
        <View style={styles.formBentoCard}>
          <Text style={styles.sectionTitleLabel}>ADD NEW BUS ROUTE</Text>
          {renderInput("Route Name", "route", "map", "e.g. Campus to Azimpur")}
          {renderInput(
            "Departure Time",
            "departureTime",
            "clock",
            "e.g. 07:00 AM"
          )}
          {renderInput(
            "Bus Number (Optional)",
            "busNumber",
            "hash",
            "e.g. Bus 15"
          )}
          {renderInput(
            "Stops (Comma Separated)",
            "stops",
            "map-pin",
            "e.g. Azimpur, Dhanmondi, Savar"
          )}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              createMutation.isPending && { opacity: 0.7 },
            ]}
            onPress={handleAddRoute}
            disabled={createMutation.isPending}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add bus schedule"
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Feather
                  name="plus"
                  size={16}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.submitBtnText}>Add Bus Route</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* MANAGE EXISTING */}
        <View style={styles.listBentoCard}>
          <Text style={styles.sectionTitleLabel}>
            ACTIVE ROUTES ({schedules?.length || 0})
          </Text>
          {isLoading ? (
            <ActivityIndicator
              color={BENTO_COLORS.deepNavy}
              style={{ marginVertical: 24 }}
            />
          ) : schedules?.length === 0 ? (
            <Text style={styles.emptyText}>No bus routes exist yet.</Text>
          ) : (
            schedules?.map((item: any) => (
              <View key={item.id} style={styles.activeRow}>
                <View style={styles.activeRouteIconBox}>
                  <Feather name="truck" size={16} color="#0369a1" />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.activeTitle} numberOfLines={1}>
                    {item.route}
                  </Text>
                  <Text style={styles.activeSub}>
                    {item.departureTime} • Bus: {item.busNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.route)}
                  disabled={deleteMutation.isPending}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete route: ${item.route}`}
                >
                  <Feather name="trash-2" size={16} color="#be123c" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================================================
// 2. STYLES
// ==================================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    flex: 1,
    marginLeft: 14,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  formBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 22,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  sectionTitleLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 14,
  },

  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 6,
    ...BENTO_COLORS.heroShadow,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  listBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 22,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    marginVertical: 16,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  activeRouteIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activeTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  activeSub: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff1f2",
    justifyContent: "center",
    alignItems: "center",
  },
});
