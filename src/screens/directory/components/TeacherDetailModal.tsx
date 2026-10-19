import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { TeacherDirectoryItem } from "@/services/directory-service";
import {
  TeacherProfileHeroCard,
  TeacherAcademicCard,
  TeacherOfficeAvailabilityCard,
  TeacherProfessionalProfileCard,
} from "@/components/teacher-profile";

export interface TeacherDetailModalProps {
  teacher: TeacherDirectoryItem | null;
  visible: boolean;
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = React.memo(
  ({ teacher, visible, onClose }) => {
    const insets = useSafeAreaInsets();

    const handleShare = useCallback(async () => {
      if (!teacher) return;
      const profile = teacher.teacherProfile;
      try {
        await Share.share({
          title: `Faculty Contact: ${teacher.name}`,
          message:
            `${teacher.name} (${profile?.designation || "Faculty Member"}, ${profile?.department || "Department"})\n` +
            `Teacher ID: ${profile?.teacherId || "N/A"}\n` +
            `Email: ${teacher.email || "N/A"}\n` +
            (teacher.phoneNumber ? `Phone: ${teacher.phoneNumber}\n` : "") +
            (profile?.officeRoom ? `Office: ${profile.officeRoom}\n` : "") +
            (profile?.consultationHours
              ? `Consultation: ${profile.consultationHours}\n`
              : ""),
        });
      } catch {
        // Ignored or cancelled by user
      }
    }, [teacher]);

    if (!visible || !teacher) return null;

    const profile = teacher.teacherProfile;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <View
          style={[
            styles.modalContainer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#F8FAFC"
            translucent={true}
          />

          {/* Modal Header Bar */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Faculty Profile</Text>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerActionBtn}
                activeOpacity={0.75}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Share faculty contact details"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="share-2" size={18} color="#0F172A" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.headerActionBtn}
                activeOpacity={0.75}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close faculty profile"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={19} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Profile Content */}
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 32, 48) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Profile Hero Identity Card */}
            <TeacherProfileHeroCard
              name={teacher.name}
              email={teacher.email}
              image={teacher.image}
              designation={profile?.designation}
              administrativeRole={profile?.administrativeRole}
            />

            {/* 2. Academic Position Card (Yellow / Amber Bento) */}
            <TeacherAcademicCard profile={profile} />

            {/* 3. Office & Availability Card (Mint / Emerald Bento with Phone Call & Copy) */}
            <TeacherOfficeAvailabilityCard
              profile={profile}
              phoneNumber={teacher.phoneNumber}
            />

            {/* 4. Professional Profile Card (Lavender / Purple Bento with Sorted Qualifications & Links) */}
            <TeacherProfessionalProfileCard profile={profile} />
          </ScrollView>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    padding: 7,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 18,
  },
});
