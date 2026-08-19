import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fillQuickAccount = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setErrorMsg("");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res?.success) {
        // AuthContext automatically updates user session
      }
    } catch (err) {
      console.error("Mobile login error:", err);
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Branding Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={32} color="#ffffff" />
          </View>
          <Text style={styles.brandName}>EduVerse</Text>
          <Text style={styles.brandTagline}>Academic Learning LMS</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to EduVerse</Text>
          <Text style={styles.cardSubtitle}>Enter your registered institutional credentials.</Text>

          {/* Quick Account Fill Selector */}
          <Text style={styles.quickLabel}>Quick Demo Select:</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity
              style={[styles.pill, styles.studentPill]}
              onPress={() => fillQuickAccount("ashutosh123@gmail.com", "Avinash@123")}
            >
              <Ionicons name="book-outline" size={12} color={COLORS.primary} />
              <Text style={[styles.pillText, { color: COLORS.primary }]}>Student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, styles.teacherPill]}
              onPress={() => fillQuickAccount("avinashsingh888161@gmail.com", "Avinash@123")}
            >
              <Feather name="user-check" size={12} color={COLORS.accent} />
              <Text style={[styles.pillText, { color: COLORS.accent }]}>Teacher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, styles.adminPill]}
              onPress={() => fillQuickAccount("admin@eduverse.com", "Admin@123")}
            >
              <Feather name="shield" size={12} color={COLORS.warning} />
              <Text style={[styles.pillText, { color: COLORS.warning }]}>Admin</Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="student@university.edu"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Sign In to App</Text>
                <Feather name="arrow-right" size={16} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchHighlight}>Register now</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...SHADOWS.medium,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  brandTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentPill: {
    backgroundColor: COLORS.primaryLight,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  teacherPill: {
    backgroundColor: COLORS.accentLight,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  adminPill: {
    backgroundColor: COLORS.warningLight,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.danger,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgMain,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
  },
  submitBtn: {
    height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    ...SHADOWS.small,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  switchRow: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  switchHighlight: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default LoginScreen;
