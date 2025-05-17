import React from "react";
import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomBottomBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    />
  );
}
