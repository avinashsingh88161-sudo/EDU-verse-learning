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
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const TeacherRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [selectedReq, setSelectedReq] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await apiClient.get("/admin/teacher-requests");
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (e) {
      console.error("Fetch mobile teacher requests error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const res = await apiClient.put(`/admin/teacher-requests/${selectedReq._id}/approve`);
      if (res.data?.success) {
        Alert.alert("Approved", `Teacher ${selectedReq.name} approved successfully!`);
        setIsApproveModalOpen(false);
        setSelectedReq(null);
        fetchRequests();
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const res = await apiClient.put(`/admin/teacher-requests/${selectedReq._id}/reject`, {
        rejectionReason,
      });
      if (res.data?.success) {
        Alert.alert("Rejected", `Registration request for ${selectedReq.name} was rejected.`);
        setIsRejectModalOpen(false);
        setSelectedReq(null);
        fetchRequests();
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="HOD Approval Panel" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Text style={styles.pageTitle}>Teacher Registration Requests</Text>
        <Text style={styles.pageSubtitle}>Review and approve candidate faculty registration requests.</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={48} color={COLORS.success} />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No pending teacher registration requests requiring review.</Text>
          </View>
        ) : (
          requests.map((item) => (
            <View key={item._id} style={styles.reqCard}>
              <View style={styles.reqHeader}>
                <Text style={styles.deptText}>{item.department || "Computer Science"}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "approved"
                          ? COLORS.successLight
                          : item.status === "rejected"
                          ? COLORS.dangerLight
                          : COLORS.warningLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "approved"
                            ? COLORS.success
                            : item.status === "rejected"
                            ? COLORS.danger
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.emailText}>{item.email}</Text>
              <Text style={styles.dateText}>
                Submitted: {new Date(item.createdAt).toLocaleDateString()}
              </Text>

              {item.status === "pending" && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => {
                      setSelectedReq(item);
                      setIsApproveModalOpen(true);
                    }}
                  >
                    <Feather name="check" size={16} color="#ffffff" />
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => {
                      setSelectedReq(item);
                      setRejectionReason("");
                      setIsRejectModalOpen(true);
                    }}
                  >
                    <Feather name="x" size={16} color="#ffffff" />
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Accept Modal */}
      <Modal visible={isApproveModalOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Approve Teacher Registration</Text>
            <Text style={styles.modalText}>
              Are you sure you want to approve <Text style={{ fontWeight: "700" }}>{selectedReq?.name}</Text> ({selectedReq?.email}) as an authorized Teacher?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsApproveModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmApproveBtn} onPress={handleApprove} disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Approve Teacher</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={isRejectModalOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Teacher Registration</Text>
            <Text style={styles.modalText}>
              Rejecting request for <Text style={{ fontWeight: "700" }}>{selectedReq?.name}</Text>.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Rejection Reason (Optional)..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsRejectModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmRejectBtn} onPress={handleReject} disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Rejection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgMain },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textMain, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  reqCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  reqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  deptText: { fontSize: 11, fontWeight: "800", color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  nameText: { fontSize: 16, fontWeight: "800", color: COLORS.textMain, marginBottom: 2 },
  emailText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  dateText: { fontSize: 11, color: COLORS.textMuted, marginBottom: 12 },
  actionRow: { flexDirection: "row", gap: 10 },
  acceptBtn: { flex: 1, height: 38, borderRadius: 8, backgroundColor: COLORS.success, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  rejectBtn: { flex: 1, height: 38, borderRadius: 8, backgroundColor: COLORS.danger, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  btnText: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  emptyCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 32, alignItems: "center", marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain, marginTop: 12 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: "center", marginTop: 4 },
  overlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.45)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textMain, marginBottom: 8 },
  modalText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 },
  input: { backgroundColor: COLORS.bgMain, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderSubtle },
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  confirmApproveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.success },
  confirmRejectBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.danger },
  confirmBtnText: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
});

export default TeacherRequestsScreen;
