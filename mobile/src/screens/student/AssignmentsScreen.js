import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const AssignmentsScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal Submission state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      const [coursesRes, mySubsRes] = await Promise.all([
        apiClient.get("/courses"),
        apiClient.get("/assignment-submissions/my-submissions"),
      ]);

      const courses = coursesRes.data.courses || [];
      const mySubs = mySubsRes.data.submissions || [];

      // Map submissions by assignment ID
      const subMap = {};
      mySubs.forEach((sub) => {
        const aId = sub.assignment?._id || sub.assignment;
        if (aId) subMap[aId] = sub;
      });
      setSubmissionsMap(subMap);

      let allAssignments = [];
      for (const course of courses) {
        try {
          const res = await apiClient.get(`/assignments/course/${course._id}`);
          if (res.data?.assignments) {
            allAssignments = [...allAssignments, ...res.data.assignments];
          }
        } catch (e) {}
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error("Fetch mobile assignments error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const openSubmitModal = (assign) => {
    setSelectedAssignment(assign);
    setSubmissionText("");
    setIsSubmitModalOpen(true);
  };

  const handleSubmitDeliverable = async () => {
    if (!submissionText.trim()) {
      Alert.alert("Input Required", "Please enter your deliverable submission response.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post("/assignment-submissions", {
        assignmentId: selectedAssignment._id,
        file: submissionText.trim(),
      });

      if (res.data?.success) {
        Alert.alert("Success", "Assignment deliverable submitted successfully!");
        setIsSubmitModalOpen(false);
        fetchAssignments();
      }
    } catch (err) {
      console.error("Submit deliverable error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to submit deliverable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Academic Tasks" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Text style={styles.pageTitle}>Assignments & Tasks</Text>
        <Text style={styles.pageSubtitle}>Review assignment deliverables, due dates, and track grading feedback.</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : assignments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Assignments Found</Text>
            <Text style={styles.emptyText}>There are currently no active assignments assigned to your courses.</Text>
          </View>
        ) : (
          assignments.map((assign) => {
            const sub = submissionsMap[assign._id];
            const isGraded = sub?.status === "graded";
            const isSubmitted = !!sub;

            return (
              <View key={assign._id} style={styles.assignmentCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.courseBadge}>
                    {assign.course?.title || "Academic Course"}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isGraded
                          ? COLORS.successLight
                          : isSubmitted
                          ? COLORS.accentLight
                          : COLORS.warningLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isGraded
                            ? COLORS.success
                            : isSubmitted
                            ? COLORS.accent
                            : COLORS.warning,
                        },
                      ]}
                    >
                      {isGraded ? "Graded" : isSubmitted ? "Submitted" : "Pending"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.assignmentTitle}>{assign.title}</Text>
                <Text style={styles.assignmentDesc} numberOfLines={2}>
                  {assign.description || "Submit task deliverables before the specified institutional deadline."}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>
                      Due: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : "No Deadline"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="award" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>Marks: {assign.totalMarks || 100}</Text>
                  </View>
                </View>

                {isGraded && (
                  <View style={styles.gradedBox}>
                    <Text style={styles.gradedScoreText}>
                      Score Awarded: <Text style={styles.scoreHighlight}>{sub.marks}</Text> / {assign.totalMarks || 100}
                    </Text>
                    {sub.feedback ? (
                      <Text style={styles.feedbackText}>Feedback: "{sub.feedback}"</Text>
                    ) : null}
                  </View>
                )}

                {!isSubmitted && (
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => openSubmitModal(assign)}
                    activeOpacity={0.85}
                  >
                    <Feather name="upload" size={15} color="#ffffff" />
                    <Text style={styles.submitBtnText}>Submit Deliverable</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Submission Modal */}
      <Modal visible={isSubmitModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Assignment</Text>
              <TouchableOpacity onPress={() => setIsSubmitModalOpen(false)}>
                <Feather name="x" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedAssignment && (
              <>
                <Text style={styles.modalSubTitle}>{selectedAssignment.title}</Text>
                <TextInput
                  style={styles.modalInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Paste GitHub URL, Google Drive link, or submission text details..."
                  placeholderTextColor={COLORS.textMuted}
                  value={submissionText}
                  onChangeText={setSubmissionText}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsSubmitModalOpen(false)}
                    disabled={submitting}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleSubmitDeliverable}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.confirmSubmitText}>Submit Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  assignmentCard: {
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
  courseBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  assignmentTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  assignmentDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  gradedBox: {
    backgroundColor: COLORS.successLight,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    marginBottom: 6,
  },
  gradedScoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  scoreHighlight: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.success,
  },
  feedbackText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  submitBtn: {
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  modalSubTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: COLORS.bgMain,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textMain,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  confirmSubmitText: {
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

export default AssignmentsScreen;
