// src/utils/registerPushToken.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from "expo-device";
import { doc, updateDoc } from "firebase/firestore";
// import { db } from "../config/firebase";
import {db} from "@/config/firebase"; // Adjust the import path as necessary
export const registerForPushNotificationsAsync = async (userId: string) => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Push notification permission denied");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    if (token) {
      console.log("📲 Expo Push Token:", token);
      await updateDoc(doc(db, "users", userId), {
        pushToken: token,
      });
    }
  } else {
    console.log("❌ Must use physical device for Push Notifications");
  }
};
