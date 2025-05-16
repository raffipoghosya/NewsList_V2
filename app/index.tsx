import { useRouter } from "expo-router";
import React from "react";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReady(true);
      router.replace({ pathname: "/SplashScreen" as any }); 
    }, 100); // կարճ դադար, որպեսզի layout-ը մաունթվի

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Բեռնվում է...</Text>
    </View>
  );
}
