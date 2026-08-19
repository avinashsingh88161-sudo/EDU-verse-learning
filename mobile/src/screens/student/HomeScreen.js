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
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsCount: 0,
    quizzesCount: 0,
    progressPercentage: 0,
  });

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchStudentData = useCallback(async () => {
    try {
      const [coursesRes, subsRes, notifsRes] = await Promise.allSettled([
        apiClient.get("/courses"),
        apiClient.get("/assignment-submissions/my-submissions"),
        apiClient.get("/notifications"),
      ]);

      let courses = [];
      if (coursesRes.status === "fulfilled" && coursesRes.value.data) {
        courses = coursesRes.value.data.courses || [];
        setEnrolledCourses(courses.slice(0, 3));
      }

      let submissionsCount = 0;
      if (subsRes.status === "fulfilled" && subsRes.value.data) {
        submissionsCount = subsRes.value.data.submissions?.length || 0;
      }

      let unreadCount = 0;
      if (notifsRes.status === "fulfilled" && notifsRes.value.data) {
        const notifs = notifsRes.value.data.notifications || [];
        unreadCount = notifs.filter((n) => !n.isRead).length;
        setUnreadNotificationsCount(unreadCount);
      }

      // Calculate student metrics from dynamic endpoints
      let totalQuizzes = 0;
      let totalAssignments = 0;

      for (const course of courses) {
        try {
          const [qRes, aRes] = await Promise.all([
            apiClient.get(`/quizzes/course/${course._id}`),
            apiClient.get(`/assignments/course/${course._id}`),
          ]);
          totalQuizzes += qRes.data.quizzes?.length || 0;
          totalAssignments += aRes.data.assignments?.length || 0;
        } catch (e) {}
      }

      const calculatedProgress = courses.length > 0 ? Math.min(85, courses.length * 25) : 0;

      setStats({
        coursesCount: courses.length,
        assignmentsCount: totalAssignments,
        quizzesCount: totalQuizzes,
        progressPercentage: calculatedProgress,
      });
    } catch (error) {
      console.error("Fetch mobile student home data error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="EduVerse Portal" navigation={navigation} unreadCount={unreadNotificationsCount} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Welcome Greeting Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeEyebrowRow}>
            <Ionicons name="sparkles" size={14} color="#f59e0b" />
            <Text style={styles.welcomeEyebrow}>ACADEMIC DASHBOARD</Text>
          </View>
          <Text style={styles.welcomeTitle}>
            Welcome back, {user?.name ? user.name.split(" ")[0] : "Student"} 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Track your course deliverables, lecture notes, and upcoming quiz assessments.
          </Text>
        </View>

        {/* 2x2 Summary Stat Cards */}
        <Text style={styles.sectionHeader}>Overview & Metrics</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Courses")}
              activeOpacity={0.8}
            >
              <View style={[styles.statIconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="book-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>{stats.coursesCount}</Text>
              <Text style={styles.statLabel}>Courses Enrolled</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Assignments")}
              activeOpacity={0.8}
            >
              <View style={[styles.statIconBox, { backgroundColor: COLORS.accentLight }]}>
                <Feather name="file-text" size={22} color={COLORS.accent} />
              </View>
              <Text style={styles.statNumber}>{stats.assignmentsCount}</Text>
              <Text style={styles.statLabel}>Assignments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate("Courses")}
              activeOpacity={0.8}
            >
              <View style={[styles.statIconBox, { backgroundColor: COLORS.warningLight }]}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={COLORS.warning} />
              </View>
              <Text style={styles.statNumber}>{stats.quizzesCount}</Text>
              <Text style={styles.statLabel}>Quizzes</Text>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: COLORS.successLight }]}>
                <Feather name="trending-up" size={22} color={COLORS.success} />
              </View>
              <Text style={styles.statNumber}>{stats.progressPercentage}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
          </View>
        )}

        {/* My Enrolled Courses Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>Enrolled Courses</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Courses")}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {enrolledCourses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No enrolled courses found.</Text>
          </View>
        ) : (
          enrolledCourses.map((course) => (
            <TouchableOpacity
              key={course._id}
              style={styles.courseItemCard}
              onPress={() => navigation.navigate("CourseDetail", { courseId: course._id })}
              activeOpacity={0.85}
            >
              <View style={styles.courseHeaderRow}>
                <Text style={styles.courseSubjectBadge}>{course.subject || "Computer Science"}</Text>
                <Text style={styles.courseStudentsCount}>{course.enrolledStudents?.length || 0} Students</Text>
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseInstructor}>
                Instructor: {course.teacher?.name || "Faculty Member"}
              </Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: "65%" }]} />
                </View>
                <Text style={styles.progressText}>65% Complete</Text>
              </View>
            </TouchableOpacity>
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
  welcomeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
  },
  welcomeEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  welcomeEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: COLORS.primary,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  courseItemCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  courseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  courseSubjectBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courseStudentsCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgSubtle,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  emptyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});

export default HomeScreen;
