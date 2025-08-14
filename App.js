import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
import { useFonts } from 'expo-font'; // ✅ 1. Ներմուծում ենք useFonts-ը

import RegisterScreen from "./app/RegisterScreen";
import LoginScreen from "./app/LoginScreen";
import HomeScreen from "./app/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  // ✅ 2. Կանչում ենք useFonts hook-ը՝ տառատեսակները բեռնելու համար
  const [fontsLoaded] = useFonts({
    'Montserrat-Arm-Regular': require('./assets/fonts/Montserratarm-Regular.woff2'),
    'Montserrat-Arm-Medium': require('./assets/fonts/Montserratarm-Medium.woff2'),
    'Montserrat-Arm-SemiBold': require('./assets/fonts/Montserratarm-SemiBold.woff2'),
    'Montserrat-Arm-Bold': require('./assets/fonts/Montserratarm-Bold.woff2'),
  });

  const [pushToken, setPushToken] = useState(null);

  // Push Token ստանալու ֆունկցիա
  const getPushToken = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission for notifications is required!");
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    console.log("Push Token: ", token);
    setPushToken(token);
  };

  const navigationRef = useRef();

  // Deep Linking-ից URL ստանալու և նավիգացիա կատարելու ֆունկցիա
  const handleDeepLink = (event) => {
    let url = event.url;
    console.log("Opened with URL:", url);

    if (url.includes("resetPassword")) {
      navigationRef.current?.navigate("LoginScreen", { resetPassword: true });
    }
  };

  useEffect(() => {
    getPushToken();

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Initial URL: ", url);
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // ✅ 3. Ստուգում ենք՝ արդյոք տառատեսակները բեռնվել են
  if (!fontsLoaded) {
    return null; // Կամ կարող եք վերադարձնել բեռնման էկրան (Splash Screen), մինչև տառատեսակները բեռնվեն
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName="RegisterScreen"
        screenOptions={{ headerShown: false }} // Թաքցնում ենք բոլոր էկրանների վերնագրերը
      >
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}