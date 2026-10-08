// src/screens/exams/exam-routine-screen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import api from "@/services/api";
import { getExamTheme } from "./theme";
import { ExamTabType } from "./types";
import {
  normalizeHubExams,
  getNextUpcomingExam,
  getHeroStatus,
  getCountdown,
  getExamsByType,
} from "./utils";
import { ExamRoutineHeader } from "./components/exam-routine-header";
import { NextExamHero } from "./components/next-exam-hero";
import { ExamTypeTabs } from "./components/exam-type-tabs";
import { ExamSchedule } from "./components/exam-schedule";
import { ExamEmptyState } from "./components/exam-empty-state";
import { ExamLoadingSkeleton } from "./components/exam-skeleton";
import { ExamErrorState } from "./components/exam-error-state";

export function ExamRoutineScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMemo(() => getExamTheme(isDark), [isDark]);

  // Tab State: ONLY TWO TABS (Midterms | Finals)
  const [selectedTab, setSelectedTab] = useState<ExamTabType>("Midterms");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Clock Timer: Updates every 30 seconds so all statuses & countdowns update dynamically
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real joined course hubs from backend API
  const {
    data: myHubs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => {
      const response = await api.get("/hubs/my");
      return response.data?.data || [];
    },
  });

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setCurrentTime(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  // 1. Normalize backend exams into validated model
  const allExams = useMemo(() => {
    return normalizeHubExams(myHubs);
  }, [myHubs]);

  // 2. Select NEXT EXAM strictly using real time against start/end dates
  // (NEVER returns a completed exam! Returns null if all exams finished)
  const nextExam = useMemo(() => {
    return getNextUpcomingExam(allExams, currentTime);
  }, [allExams, currentTime]);

  // 3. Dynamic hero status and countdown
  const heroStatus = useMemo(() => {
    return getHeroStatus(nextExam, currentTime);
  }, [nextExam, currentTime]);

  const countdown = useMemo(() => {
    return getCountdown(nextExam, currentTime);
  }, [nextExam, currentTime]);

  // 4. Tab filtering: Midterms vs Finals
  const midtermExams = useMemo(() => {
    return getExamsByType(allExams, "Midterms");
  }, [allExams]);

  const finalExams = useMemo(() => {
    return getExamsByType(allExams, "Finals");
  }, [allExams]);

  const activeExams = useMemo(() => {
    return selectedTab === "Midterms" ? midtermExams : finalExams;
  }, [selectedTab, midtermExams, finalExams]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Pinned Explore-style Header */}
      <ExamRoutineHeader theme={theme} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.mint, theme.deepNavy]}
            tintColor={theme.mint}
          />
        }
      >
        <View style={styles.contentWrapper}>
          {/* Loading & Error States */}
          {isLoading ? (
            <ExamLoadingSkeleton theme={theme} />
          ) : isError ? (
            <ExamErrorState onRetry={refetch} theme={theme} />
          ) : (
            <>
              {/* Next Exam Hero Bento Card */}
              <NextExamHero
                nextExam={nextExam}
                heroStatus={heroStatus}
                countdown={countdown}
                theme={theme}
              />

              {/* Segmented Tabs (Midterms | Finals) */}
              <ExamTypeTabs
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
                midtermCount={midtermExams.length}
                finalCount={finalExams.length}
                theme={theme}
              />

              {/* Schedule List or Empty State */}
              {activeExams.length === 0 ? (
                <ExamEmptyState
                  selectedTab={selectedTab}
                  hasAnyExams={allExams.length > 0}
                  theme={theme}
                />
              ) : (
                <ExamSchedule
                  exams={activeExams}
                  currentTime={currentTime}
                  theme={theme}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
  },
});
