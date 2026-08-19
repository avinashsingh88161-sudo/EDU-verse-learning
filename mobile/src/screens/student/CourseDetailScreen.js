import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params || {};
  const [course, setCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("notes"); // "notes" | "assignments" | "quizzes"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const [courseRes, notesRes, quizzesRes, assignRes] = await Promise.allSettled([
        apiClient.get(`/courses/${courseId}`),
        apiClient.get(`/notes/course/${courseId}`),
        apiClient.get(`/quizzes/course/${courseId}`),
        apiClient.get(`/assignments/course/${courseId}`),
      ]);

      if (courseRes.status === "fulfilled") {
        setCourse(courseRes.value.data.course);
      }
      if (notesRes.status === "fulfilled") {
        setNotes(notesRes.value.data.notes || []);
      }
      if (quizzesRes.status === "fulfilled") {
        setQuizzes(quizzesRes.value.data.quizzes || []);
      }
      if (assignRes.status === "fulfilled") {
        setAssignments(assignRes.value.data.assignments || []);
      }
    } catch (e) {
      console.error("Course detail fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Course Content" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : !course ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Header Card */}
          <View style={styles.courseHeaderCard}>
            <Text style={styles.deptBadge}>{course.subject || "Computer Science"}</Text>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDesc}>
              {course.description || "Academic course syllabus, lecture materials, assignments, and test assessments."}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="user" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{course.teacher?.name || "Faculty Member"}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{course.enrolledStudents?.length || 0} Students</Text>
              </View>
            </View>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "notes" && styles.activeTabBtn]}
              onPress={() => setActiveTab("notes")}
            >
              <Text style={[styles.tabText, activeTab === "notes" && styles.activeTabText]}>
                Notes ({notes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "assignments" && styles.activeTabBtn]}
              onPress={() => setActiveTab("assignments")}
            >
              <Text style={[styles.tabText, activeTab === "assignments" && styles.activeTabText]}>
                Tasks ({assignments.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "quizzes" && styles.activeTabBtn]}
              onPress={() => setActiveTab("quizzes")}
            >
              <Text style={[styles.tabText, activeTab === "quizzes" && styles.activeTabText]}>
                Quizzes ({quizzes.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Contents */}
          {activeTab === "notes" && (
            notes.length === 0 ? (
              <View style={styles.emptyTabBox}>
                <Feather name="file-text" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyTabText}>No lecture notes uploaded yet.</Text>
              </View>
            ) : (
              notes.map((n) => (
                <View key={n._id} style={styles.itemCard}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <Feather name="file" size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.itemContent} numberOfLines={3}>{n.content}</Text>
                  <Text style={styles.itemDate}>
                    Uploaded: {new Date(n.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )
          )}

          {activeTab === "assignments" && (
            assignments.length === 0 ? (
              <View style={styles.emptyTabBox}>
                <Feather name="check-square" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyTabText}>No assignments posted yet.</Text>
              </View>
            ) : (
              assignments.map((a) => (
                <View key={a._id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{a.title}</Text>
                  <Text style={styles.itemContent} numberOfLines={2}>{a.description}</Text>
                  <View style={styles.itemFooterRow}>
                    <Text style={styles.itemDate}>
                      Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A"}
                    </Text>
                    <Text style={styles.marksBadge}>Marks: {a.totalMarks || 100}</Text>
                  </View>
                </View>
              ))
            )
          )}

          {activeTab === "quizzes" && (
            quizzes.length === 0 ? (
              <View style={styles.emptyTabBox}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyTabText}>No active quizzes found.</Text>
              </View>
            ) : (
              quizzes.map((q) => (
                <View key={q._id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{q.title}</Text>
                  <Text style={styles.itemContent}>
                    Questions: {q.questions?.length || 0} | Duration: {q.timeLimit || 15} mins
                  </Text>
                  <TouchableOpacity style={styles.quizBtn}>
                    <Text style={styles.quizBtnText}>Attempt Quiz</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          )}
        </ScrollView>
      )}
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
  courseHeaderCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
  },
  deptBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: "#ffffff",
  },
  itemCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  itemContent: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  itemFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  marksBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  quizBtn: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
  },
  quizBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  emptyTabBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  emptyTabText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  errorContainer: {
    padding: 32,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
  },
});

export default CourseDetailScreen;
