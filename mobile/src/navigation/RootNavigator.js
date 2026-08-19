import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../theme/theme";

import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import StudentTabNavigator from "./StudentTabNavigator";
import TeacherTabNavigator from "./TeacherTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bgMain }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!token || !user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  const role = (user.role || "").toLowerCase();

  if (role === "teacher" || role === "faculty") {
    return <TeacherTabNavigator />;
  }

  if (role === "admin") {
    return <AdminTabNavigator />;
  }

  return <StudentTabNavigator />;
};

export default RootNavigator;
