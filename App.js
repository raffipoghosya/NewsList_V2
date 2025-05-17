import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { Linking } from "react-native";

import RegisterScreen from "./app/RegisterScreen";
import LoginScreen from "./app/LoginScreen";
import HomeScreen from "./app/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
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

  // Deep Linking-ից URL ստանալու և նավիգացիա կատարելու ֆունկցիա
  const handleDeepLink = (event) => {
    let url = event.url;
    console.log("Opened with URL:", url);

    // Օրինակ, եթե URL-ը պարունակում է resetPassword, ուղարկել LoginScreen-ին
    if (url.includes("resetPassword")) {
      navigationRef.current?.navigate("LoginScreen", { resetPassword: true });
    }
  };

  // React Navigation-ի համար ref (հիմա առաջիկայում օգտագործելու ենք deep linking-ի համար)
  const navigationRef = React.useRef();

  useEffect(() => {
    getPushToken();

    // Ստուգում ենք, եթե հավելվածը բացվել է deep link-ով
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Initial URL: ", url);
        handleDeepLink({ url });
      }
    });

    // Ակտիվ հետևում ենք deep linking event-ները
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="RegisterScreen">
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
