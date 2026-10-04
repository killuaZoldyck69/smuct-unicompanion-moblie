import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { getMyHubs } from "@/services/hub-service";
import { BENTO_COLORS, CourseEntry, fontFamily } from "./constants";
import { calculateCGPA } from "./utils";
import { CGPAHeroCard } from "./components/cgpa-hero-card";
import { CourseEntryCard } from "./components/course-entry-card";
import { GradePickerModal } from "./components/grade-picker-modal";
import { GradeScaleModal } from "./components/grade-scale-modal";

const INITIAL_COURSES: CourseEntry[] = [
  {
    id: "initial-1",
    code: "",
    title: "",
    credit: "3",
    grade: "",
  },
];

export function CGPACalculator() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [courses, setCourses] = useState<CourseEntry[]>(INITIAL_COURSES);
  const [activePickerCourseId, setActivePickerCourseId] = useState<string | null>(null);
  const [isScaleModalVisible, setIsScaleModalVisible] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const { data: myHubs, refetch: refetchHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: getMyHubs,
  });

  const addCourseRow = useCallback(() => {
    setCourses((prev) => [
      ...prev,
      {
        id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: "",
        title: "",
        credit: "3",
        grade: "",
      },
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

  const handleAutoFill = useCallback(async () => {
    setIsAutoFilling(true);
    try {
      let hubsData = myHubs;
      // If hubsData is not present, fetch fresh from server
      if (!hubsData || (Array.isArray(hubsData) && hubsData.length === 0)) {
        const refetched = await refetchHubs();
        hubsData = refetched.data;
      }

      const rawList = Array.isArray(hubsData)
        ? hubsData
        : (hubsData as any)?.data || [];

      const extracted: CourseEntry[] = [];
      rawList.forEach((item: any, idx: number) => {
        const hub = item?.hub || item;
        if (!hub || hub.isArchived) return;

        const code = (hub.courseCode || hub.code || "").trim();
        const title = (hub.courseName || hub.name || hub.title || "").trim();
        const credit = hub.credit ? String(hub.credit) : "3";

        if (code || title) {
          extracted.push({
            id: `hub-${hub.id || idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            code: code,
            title: title,
            name: code && title ? `${code} - ${title}` : code || title,
            credit: credit,
            grade: "",
          });
        }
      });

      if (extracted.length > 0) {
        setCourses(extracted);
        Toast.show({
          type: "success",
          text1: "Courses Auto-filled!",
          text2: `Successfully loaded ${extracted.length} courses from your registered hubs.`,
        });
      } else {
        // Fallback: If no hubs are registered in this user's account, load standard registered courses
        const sampleEnrolled: CourseEntry[] = [
          {
            id: `sample-1-${Date.now()}`,
            code: "CSE2011",
            title: "Data Structure",
            credit: "3",
            grade: "",
          },
          {
            id: `sample-2-${Date.now()}`,
            code: "CSE4114",
            title: "Mobile Application and Development",
            credit: "3",
            grade: "",
          },
          {
            id: `sample-3-${Date.now()}`,
            code: "CSE3123",
            title: "JavaFX",
            credit: "3",
            grade: "",
          },
          {
            id: `sample-4-${Date.now()}`,
            code: "CSE2201",
            title: "Python",
            credit: "3",
            grade: "",
          },
        ];
        setCourses(sampleEnrolled);
        Toast.show({
          type: "info",
          text1: "Courses Loaded",
          text2: "No registered course hubs found on your account. Loaded standard semester courses.",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Auto-fill Failed",
        text2: "Unable to retrieve course hubs. Please try again.",
      });
    } finally {
      setIsAutoFilling(false);
    }
  }, [myHubs, refetchHubs]);

  const handleClearAll = useCallback(() => {
    setCourses([
      {
        id: `empty-${Date.now()}`,
        code: "",
        title: "",
        credit: "3",
        grade: "",
      },
    ]);
    Toast.show({
      type: "info",
      text1: "Courses Cleared",
      text2: "You can tap 'Auto-fill My Courses' to load them again.",
    });
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


  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitlesContainer}>
            <Text style={styles.screenTitle}>CGPA Calculator</Text>
            <Text style={styles.screenSubtitle}>
              Estimate your semester results
            </Text>
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
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 130 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bento Summary Card */}
          <CGPAHeroCard result={cgpaResult} />

          {/* Auto-fill My Courses Banner Card */}
          <View style={styles.autoFillBanner}>
            <TouchableOpacity
              style={styles.autoFillLeftCol}
              onPress={handleAutoFill}
              disabled={isAutoFilling}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Auto-fill enrolled courses from your hubs"
            >
              {isAutoFilling ? (
                <ActivityIndicator
                  size="small"
                  color="#4f46e5"
                  style={{ marginRight: 10 }}
                />
              ) : (
                <Ionicons
                  name="sparkles"
                  size={22}
                  color="#4f46e5"
                  style={{ marginRight: 10 }}
                />
              )}
              <View style={styles.autoFillTextCol}>
                <Text style={styles.autoFillTitle}>Auto-fill My Courses</Text>
                <Text style={styles.autoFillSubtitle}>
                  Quickly add your registered courses
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearAll}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear all courses"
            >
              <Feather
                name="trash-2"
                size={14}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Course Entry Cards List */}
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

          {/* Add Another Course Action Button */}
          <TouchableOpacity
            style={styles.addCourseOutlineBtn}
            onPress={addCourseRow}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add another course"
          >
            <Feather
              name="plus"
              size={18}
              color={BENTO_COLORS.primaryBlue}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addCourseOutlineBtnText}>Add Another Course</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Grade Selector Bottom Sheet Modal */}
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

        {/* Official UGC Grading Scale Modal */}
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
    paddingBottom: 12,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.borderColor,
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  screenTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    textAlign: "left",
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
    textAlign: "left",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  autoFillBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff4ff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbeafe",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  autoFillLeftCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  autoFillTextCol: {
    flex: 1,
  },
  autoFillTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#1e1b4b",
  },
  autoFillSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clearBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  coursesListContainer: {
    marginBottom: 4,
  },
  addCourseOutlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1.5,
    borderColor: BENTO_COLORS.primaryBlue,
    borderRadius: 16,
    height: 48,
    marginBottom: 20,
  },
  addCourseOutlineBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
});
