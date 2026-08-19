import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import MobileHeader from "../../components/MobileHeader";

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <MobileHeader title="Application Settings" navigation={navigation} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>App Settings</Text>

        {/* User Quick Info */}
        <View style={styles.userCard}>
          <Text style={styles.nameText}>{user?.name || "Student User"}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* Notification Settings */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive instant alerts on smartphone</Text>
            </View>
            <Switch
              value={pushAlerts}
              onValueChange={setPushAlerts}
              trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Email Announcements</Text>
              <Text style={styles.settingDesc}>Receive assignment deadlines via email</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Appearance Settings */}
        <Text style={styles.sectionHeader}>Appearance & Theme</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Dark Theme Mode</Text>
              <Text style={styles.settingDesc}>Switch interface to dark colors</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(val) => {
                setDarkMode(val);
                Alert.alert("Theme Option", "Dark mode interface setting updated.");
              }}
              trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Security & System Info */}
        <Text style={styles.sectionHeader}>About System</Text>
        <View style={styles.settingCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform API Version</Text>
            <Text style={styles.infoValue}>v1.0.0 (Node/MongoDB)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile Framework</Text>
            <Text style={styles.infoValue}>React Native + Expo</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert("Confirm Logout", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: () => logout() },
            ]);
          }}
        >
          <Feather name="log-out" size={16} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  emailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  settingCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  logoutBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.danger,
  },
});

export default SettingsScreen;
