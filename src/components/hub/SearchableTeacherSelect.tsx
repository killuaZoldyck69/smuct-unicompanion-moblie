import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 👈 New Import
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded } from "../../theme/layout";

interface Teacher {
  id: string;
  name: string;
  email: string;
  teacherProfile?: { department: string; designation: string }; // 👈 Added designation
}

interface Props {
  teachers: Teacher[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export default function SearchableTeacherSelect({
  teachers,
  selectedId,
  onSelect,
  isLoading,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedTeacher = teachers.find((t) => t.id === selectedId);

  const filteredTeachers = useMemo(() => {
    if (!search) return teachers;
    const lowerQ = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQ) ||
        t.teacherProfile?.department?.toLowerCase().includes(lowerQ) ||
        t.teacherProfile?.designation?.toLowerCase().includes(lowerQ),
    );
  }, [search, teachers]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsVisible(false);
    setSearch("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectorBtn}
        onPress={() => setIsVisible(true)}
      >
        <Feather
          name="user"
          size={18}
          color={colors.outline}
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            styles.selectorText,
            !selectedTeacher && { color: colors.outlineVariant },
          ]}
        >
          {isLoading
            ? "Loading..."
            : selectedTeacher
              ? selectedTeacher.name
              : "Search & Select Instructor"}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.outline} />
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <SafeAreaView style={styles.bottomSheet} edges={["top"]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Instructor</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Feather
                name="search"
                size={18}
                color={colors.outline}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, dept, or designation..."
                placeholderTextColor={colors.outlineVariant}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredTeachers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.teacherRow}
                  onPress={() => handleSelect(item.id)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teacherName}>{item.name}</Text>
                    {/* 👈 Updated UI to show Designation • Department */}
                    <Text style={styles.teacherDept}>
                      {item.teacherProfile?.designation || "Faculty"} •{" "}
                      {item.teacherProfile?.department || "Dept"}
                    </Text>
                  </View>
                  {selectedId === item.id && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No instructors found.</Text>
              }
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: spacing.stackMd,
  },
  selectorText: { flex: 1, ...typography.bodyMd, color: colors.onSurface },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: rounded.xl,
    borderTopRightRadius: rounded.xl,
    height: "85%",
    padding: spacing.marginMobile,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  sheetTitle: { ...typography.titleLg, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: spacing.stackLg,
  },
  searchInput: { flex: 1, ...typography.bodyMd, color: colors.onSurface },
  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer + "30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.primary,
    fontWeight: "700",
  },
  teacherName: {
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.onSurface,
  },
  teacherDept: { ...typography.labelSm, color: colors.outline, marginTop: 2 },
  emptyText: {
    textAlign: "center",
    ...typography.bodyMd,
    color: colors.outline,
    marginTop: 40,
  },
});
