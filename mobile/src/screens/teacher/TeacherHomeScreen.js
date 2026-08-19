import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const TeacherHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedQuizzes: 0,
    pendingAssignmentReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/teacher/dashboard-stats");
      if (res.data?.success) {
        setStats({
          totalCourses: res.data.totalCourses || 0,
          totalStudents: res.data.totalStudents || 0,
          publishedQuizzes: res.data.publishedQuizzes || 0,
          pendingAssignmentReviews: res.data.pendingAssignmentReviews || 0,
        });
      }
    } catch (e) {
      console.error("Fetch teacher stats error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const displayName = user?.name
    ? user.name.startsWith("Prof.") || user.name.startsWith("Dr.")
      ? user.name
      : `Prof. ${user.name}`
    : "Prof. Avinash Singh";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Faculty Portal" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.banner}>
          <Text style={styles.eyebrow}>FACULTY ACADEMIC CONTROL CENTER</Text>
          <Text style={styles.title}>Welcome back, {displayName} 👋</Text>
          <Text style={styles.subtitle}>
            Manage your courses, study notes, quizzes, and grade student submissions.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Instructor Overview</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.grid}>
            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="book-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.num}>{stats.totalCourses}</Text>
              <Text style={styles.label}>Courses Created</Text>
            </View>

            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.accentLight }]}>
                <Ionicons name="people-outline" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.num}>{stats.totalStudents}</Text>
              <Text style={styles.label}>Enrolled Students</Text>
            </View>

            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.warningLight }]}>
                <Feather name="file-text" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.num}>{stats.publishedQuizzes}</Text>
              <Text style={styles.label}>Published Quizzes</Text>
            </View>

            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.dangerLight }]}>
                <Feather name="clock" size={20} color={COLORS.danger} />
              </View>
              <Text style={styles.num}>{stats.pendingAssignmentReviews}</Text>
              <Text style={styles.label}>Pending Reviews</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgMain },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
  },
  eyebrow: { fontSize: 10, fontWeight: "800", color: COLORS.primary, letterSpacing: 0.8, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.textMain, marginBottom: 6 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  sectionHeader: { fontSize: 16, fontWeight: "700", color: COLORS.textMain, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "48%",
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  num: { fontSize: 22, fontWeight: "800", color: COLORS.textMain, marginBottom: 2 },
  label: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
});

export default TeacherHomeScreen;
