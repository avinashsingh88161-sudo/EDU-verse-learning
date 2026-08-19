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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/apiClient";
import MobileHeader from "../../components/MobileHeader";

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error("Fetch mobile notifications error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllRead = async () => {
    try {
      await apiClient.put("/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "ASSIGNMENT_GRADED":
        return <Feather name="award" size={18} color={COLORS.success} />;
      case "NEW_ASSIGNMENT":
        return <Feather name="file-text" size={18} color={COLORS.accent} />;
      case "NEW_QUIZ":
        return <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={COLORS.warning} />;
      case "TEACHER_REGISTRATION_REQUEST":
        return <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />;
      case "REQUEST_APPROVED":
        return <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />;
      default:
        return <Feather name="bell" size={18} color={COLORS.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Alerts & Activity" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.pageTitle}>Notifications</Text>
            <Text style={styles.pageSubtitle}>Stay updated on course announcements and grades.</Text>
          </View>
          {notifications.some((n) => !n.isRead) && (
            <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>You are all caught up! No recent alerts found.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View
              key={item._id}
              style={[
                styles.notifCard,
                !item.isRead && styles.unreadCard,
              ]}
            >
              <View style={styles.iconCircle}>{getNotifIcon(item.type)}</View>

              <View style={styles.notifContent}>
                <View style={styles.notifHeaderRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
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
  },
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  notifCard: {
    flexDirection: "row",
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  unreadCard: {
    borderColor: COLORS.primary,
    backgroundColor: "#f5f6ff",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bgSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "500",
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

export default NotificationsScreen;
