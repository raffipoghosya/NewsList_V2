import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from 'expo-notifications';  // Expo Push Notifications
import dynamicLinks from "@react-native-firebase/dynamic-links";  // Firebase Dynamic Links
import RegisterScreen from "./app/RegisterScreen";
import LoginScreen from "./app/LoginScreen";
import HomeScreen from "./app/jomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [pushToken, setPushToken] = useState(null);

  // Push Token ստանալու ֆունկցիա
  const getPushToken = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission for notifications is required!');
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Push Token: ', token);
    setPushToken(token); // Այսինքն՝ ստացած token-ը պահպանեք state-ում
  };

  useEffect(() => {
    // Ստուգեք Dynamic Link-ը, երբ հավելվածը բացվում է
    const handleDynamicLink = async () => {
      const link = await dynamicLinks().getInitialLink();

      if (link) {
        console.log("Dynamic Link է բացվել:", link.url);
        // Ստուգեք հղումը և անցեք համապատասխան էկրանին
        // Սա կուղարկի օգտագործողին LoginScreen-ու եթե տեղադրեք reset-password էկրան
        if (link.url.includes("resetPassword")) {
          // Կարող եք ավելացնել կոդ, որը ուղարկում է օգտատերին համապատասխան էկրան՝
          console.log("Փոխել գաղտնաբառը");
        }
      }
    };

    // Ստուգեք dynamic link-երը հավելվածի բացվելու ժամանակ
    handleDynamicLink();

    // Երբ dynamic link-ը բացվում է բացված ժամանակ
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);

    // Խորհուրդ է տրվում էլ կապել dynamic link listener-ի հետ
    return () => unsubscribe();
  }, []);

  // Կամավոր `getPushToken` ֆունկցիան բեռնում է հենց սկզբից
  useEffect(() => {
    getPushToken(); // Push token ստանալու առաջին անգամ
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RegisterScreen">
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
