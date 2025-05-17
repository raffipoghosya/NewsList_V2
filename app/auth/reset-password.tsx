import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "expo-router";

// Firebase կոնֆիգուրացիա
const firebaseConfig = {
  apiKey: "AIzaSyBQ2KGheZVAG61tuDnq2EU5pRBZqvJ6xoU",
  authDomain: "newsapp-ea699.firebaseapp.com",
  projectId: "newsapp-ea699",
  storageBucket: "newsapp-ea699.appspot.com",
  messagingSenderId: "273216501570",
  appId: "1:273216501570:ios:c918a0f02a61ff1e697adb"
};

// Կարգավորում Firebase միայն մեկ անգամ
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Սխալ", "Մուտքագրեք էլ․ փոստի հասցեն");
      return;
    }

    try {
      const auth = getAuth();

      // Ստեղծում ենք actionCodeSettings, որ Firebase-ը օգտագործի այս URL-ն
      const actionCodeSettings = {
        url: `https://yourapp.page.link/resetPassword?email=${email}`,
        handleCodeInApp: true,
      };
      

      // Փոխարկել գաղտնաբառը
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      Alert.alert("Փոխել գաղտնաբառը", "Ստուգեք ձեր էլ․ փոստը");
    } catch (error) {
      Alert.alert("Սխալ", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Վերականգնել գաղտնաբառը</Text>
      <TextInput
        style={styles.input}
        placeholder="Էլ․ փոստ"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Ուղարկել հղումը</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#006d77",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#00798c",
    padding: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ResetPasswordScreen;
