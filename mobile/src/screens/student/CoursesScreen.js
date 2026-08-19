import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await apiClient.get("/courses");
      if (res.data?.success) {
        setCourses(res.data.courses || []);
      }
    } catch (error) {
      console.error("Fetch mobile courses error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Academic Courses" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Text style={styles.pageTitle}>Registered Courses</Text>
        <Text style={styles.pageSubtitle}>Access syllabus content, lecture notes, and active assignments.</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Courses Enrolled</Text>
            <Text style={styles.emptyText}>You are currently not enrolled in any academic courses.</Text>
          </View>
        ) : (
          courses.map((course, idx) => (
            <View key={course._id} style={styles.courseCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.deptBadge}>{course.subject || "Computer Science"}</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>Active Course</Text>
                </View>
              </View>

              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseDescription} numberOfLines={2}>
                {course.description || "Comprehensive academic course curriculum covering foundational & advanced concepts."}
              </Text>

              <View style={styles.instructorRow}>
                <Feather name="user" size={14} color={COLORS.textSecondary} />
                <Text style={styles.instructorName}>
                  {course.teacher?.name || "Faculty Instructor"}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Course Completion</Text>
                <Text style={styles.progressValue}>{65 + (idx * 10) % 30}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${65 + (idx * 10) % 30}%` }]} />
              </View>

              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigation.navigate("CourseDetail", { courseId: course._id })}
                activeOpacity={0.85}
              >
                <Text style={styles.continueBtnText}>Continue Course</Text>
                <Feather name="arrow-right" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  courseCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  deptBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.success,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  courseDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  instructorName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgSubtle,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  continueBtn: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...SHADOWS.small,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptyContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export default CoursesScreen;
