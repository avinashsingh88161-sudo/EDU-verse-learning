import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import MobileHeader from "../../components/MobileHeader";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to sign out of EduVerse?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Student Profile" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </Text>
          </View>

          <Text style={styles.userName}>{user?.name || "Student User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "student@eduverse.com"}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name="school-outline" size={12} color={COLORS.primary} />
            <Text style={styles.roleBadgeText}>
              {(user?.role || "Student").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <Text style={styles.sectionHeader}>Account Menu</Text>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Settings")}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.primaryLight }]}>
              <Feather name="user" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>Personal Information</Text>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Notifications")}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.accentLight }]}>
              <Feather name="bell" size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Settings")}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.warningLight }]}>
              <Feather name="settings" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.menuTitle}>Settings</Text>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Settings")}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.successLight }]}>
              <Feather name="shield" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.menuTitle}>Security & Privacy</Text>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Feather name="log-out" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Sign Out from EduVerse</Text>
        </TouchableOpacity>
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
  profileHeaderCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  logoutBtn: {
    height: 48,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.danger,
  },
});

export default ProfileScreen;
