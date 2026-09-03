import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { getMyHubs } from "@/services/hub-service";
import { BENTO_COLORS, CourseEntry, fontFamily } from "./constants";
import { calculateCGPA } from "./utils";
import { CGPAHeroCard } from "./components/cgpa-hero-card";
import { CourseEntryCard } from "./components/course-entry-card";
import { GradePickerModal } from "./components/grade-picker-modal";
import { GradeScaleModal } from "./components/grade-scale-modal";

export function CGPACalculator() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: "1", name: "", credit: "3.0", grade: "" },
  ]);
  const [activePickerCourseId, setActivePickerCourseId] = useState<string | null>(null);
  const [isScaleModalVisible, setIsScaleModalVisible] = useState(false);

  const { data: myHubs, isLoading: isHubsLoading } = useQuery({
    queryKey: ["myHubs"],
    queryFn: getMyHubs,
  });

  const addCourseRow = useCallback(() => {
    setCourses((prev) => [
      ...prev,
      { id: Math.random().toString(), name: "", credit: "3.0", grade: "" },
    ]);
  }, []);

  const removeCourseRow = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCourse = useCallback(
    (id: string, field: keyof CourseEntry, value: string) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const handleAutoFill = useCallback(() => {
    if (!myHubs || myHubs.length === 0) {
      Toast.show({ type: "info", text1: "No active courses found to auto-fill." });
      return;
    }

    const activeHubs = myHubs.filter((m: any) => !m.hub?.isArchived);
    if (activeHubs.length === 0) {
      Toast.show({ type: "info", text1: "No active course hubs found." });
      return;
    }

    const imported: CourseEntry[] = activeHubs.map((m: any) => ({
      id: Math.random().toString(),
      name: `${m.hub.courseCode} - ${m.hub.courseName}`,
      credit: String(m.hub.credit || 3.0),
      grade: "",
    }));

    setCourses(imported);
    Toast.show({
      type: "success",
      text1: "Courses Imported",
      text2: `Successfully loaded ${imported.length} courses from your hubs.`,
    });
  }, [myHubs]);

  const handleClearAll = useCallback(() => {
    setCourses([{ id: Math.random().toString(), name: "", credit: "3.0", grade: "" }]);
  }, []);

  const cgpaResult = useMemo(() => calculateCGPA(courses), [courses]);

  useEffect(() => {
    const onBackPress = () => {
      if (activePickerCourseId) {
        setActivePickerCourseId(null);
        return true;
      }
      if (isScaleModalVisible) {
        setIsScaleModalVisible(false);
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [activePickerCourseId, isScaleModalVisible]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerIconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

          <View style={styles.headerTitlesContainer}>
            <Text style={styles.screenTitle}>CGPA Calculator</Text>
            <Text style={styles.screenSubtitle}>Estimate your semester results</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsScaleModalVisible(true)}
            style={styles.headerIconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View official grading scale"
            activeOpacity={0.7}
          >
            <Feather name="help-circle" size={19} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 40 : 56 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CGPAHeroCard
            result={cgpaResult}
            totalCoursesCount={courses.length}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.autoFillBtn}
              onPress={handleAutoFill}
              disabled={isHubsLoading}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Auto-fill enrolled courses from your hubs"
            >
              <Feather
                name="download-cloud"
                size={16}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.autoFillBtnText}>Auto-fill My Courses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearAll}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear all courses"
            >
              <Feather
                name="trash-2"
                size={16}
                color="#be123c"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesListContainer}>
            {courses.map((course, index) => (
              <CourseEntryCard
                key={course.id}
                course={course}
                index={index}
                canDelete={courses.length > 1}
                onUpdate={updateCourse}
                onRemove={removeCourseRow}
                onOpenGradePicker={setActivePickerCourseId}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.addCourseBtn}
            onPress={addCourseRow}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add another course"
          >
            <Feather
              name="plus-circle"
              size={18}
              color={BENTO_COLORS.deepNavy}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addCourseBtnText}>Add Another Course</Text>
          </TouchableOpacity>
        </ScrollView>

        <GradePickerModal
          visible={!!activePickerCourseId}
          onSelectGrade={(grade) => {
            if (activePickerCourseId) {
              updateCourse(activePickerCourseId, "grade", grade);
              setActivePickerCourseId(null);
            }
          }}
          onClose={() => setActivePickerCourseId(null)}
        />

        <GradeScaleModal
          visible={isScaleModalVisible}
          onClose={() => setIsScaleModalVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  autoFillBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  autoFillBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.15)",
  },
  clearBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#be123c",
  },
  coursesListContainer: {
    marginBottom: 8,
  },
  addCourseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 24,
    ...BENTO_COLORS.shadow,
  },
  addCourseBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
