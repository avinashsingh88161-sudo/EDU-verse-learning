import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

const SignupScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const [role, setRole] = useState("student"); // "student" | "teacher"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingSuccess, setPendingSuccess] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setErrorMsg("");
    setPendingSuccess("");
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department,
      };

      const res = await signup(payload);
      if (res?.pending) {
        setPendingSuccess(
          res.message ||
            "Your Teacher registration request has been submitted and is pending Admin/HOD approval."
        );
      }
    } catch (err) {
      console.error("Mobile signup error:", err);
      const msg = err.response?.data?.message || "Registration failed. Please check your details.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registration</Text>
        </View>

        <View style={styles.card}>
          {pendingSuccess ? (
            <View style={styles.pendingBox}>
              <Feather name="clock" size={40} color={COLORS.warning} style={{ marginBottom: 12 }} />
              <Text style={styles.pendingTitle}>Request Submitted!</Text>
              <Text style={styles.pendingDesc}>{pendingSuccess}</Text>
              <TouchableOpacity
                style={styles.returnBtn}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.returnBtnText}>Return to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.cardTitle}>Create EduVerse Account</Text>
              <Text style={styles.cardSubtitle}>Select your account role to continue.</Text>

              {/* Role Options */}
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === "student" && styles.activeRoleBtn]}
                  onPress={() => setRole("student")}
                >
                  <Ionicons
                    name="book-outline"
                    size={16}
                    color={role === "student" ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[styles.roleText, role === "student" && styles.activeRoleText]}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === "teacher" && styles.activeRoleBtn]}
                  onPress={() => setRole("teacher")}
                >
                  <Feather
                    name="user-check"
                    size={16}
                    color={role === "teacher" ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[styles.roleText, role === "teacher" && styles.activeRoleText]}>
                    Teacher
                  </Text>
                </TouchableOpacity>
              </View>

              {role === "teacher" && (
                <View style={styles.roleNotice}>
                  <Text style={styles.roleNoticeText}>
                    🔔 Teacher accounts require Admin/HOD verification before activation.
                  </Text>
                </View>
              )}

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Feather name="alert-circle" size={14} color={COLORS.danger} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Input Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Avinash Singh"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@university.edu"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {role === "teacher" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="School of Computing"
                    placeholderTextColor={COLORS.textMuted}
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {role === "teacher" ? "Submit Teacher Request" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
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
  roleGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgMain,
  },
  activeRoleBtn: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeRoleText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  roleNotice: {
    backgroundColor: COLORS.warningLight,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: 14,
  },
  roleNoticeText: {
    fontSize: 12,
    color: COLORS.warning,
    lineHeight: 16,
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
    marginBottom: 14,
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
  input: {
    backgroundColor: COLORS.bgMain,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: COLORS.textMain,
  },
  submitBtn: {
    height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...SHADOWS.small,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  pendingBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  pendingDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  returnBtn: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});

export default SignupScreen;
