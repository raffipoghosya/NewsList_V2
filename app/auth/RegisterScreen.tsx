import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../config/firebase";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import FLogo from "../../assets/flogo.svg";
import Frame from "../../assets/Frame.svg";
import { registerForPushNotificationsAsync } from "../utils/notifications";

const auth = getAuth();

const RegisterScreen = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Սխալ 🚫 ", "Խնդրում ենք լրացնել բոլոր դաշտերը");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Սխալ 🚫 ", "Գաղտնաբառերը չեն համընկնում");
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        firstName,
        lastName,
        city,
        email,
      });

      await registerForPushNotificationsAsync(uid);

      Alert.alert("Գրանցումը հաջողվեց  ✅","մուտք գործեք");
      router.replace({ pathname: "auth/LoginScreen" as any });

    } catch (error: any) {
      console.log("🔥 Error during register:", error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Այս email-ով 🔔", "հաշիվ արդեն գոյություն ունի");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("email-ի 🚫 ", "ձևաչափը սխալ է");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Գաղտնաբառը 🔔", "Պետք է լինի առնվազն 6 նիշ");
      } else {
        Alert.alert("Սխալ", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <Frame width={40} height={80} />
          <FLogo width={300} height={60} style={{ marginTop: 8 }} />
          <Text style={styles.ntitle}>Դարձիր մեր ընկերը</Text>
        </View>

        <Text style={styles.title}>Գրանցում</Text>

        <TextInput
          style={styles.input}
          placeholder="Անուն"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Ազգանուն"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Քաղաք"
          placeholderTextColor="#888"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Մուտքանուն (էլ․ փոստ)"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Գաղտնաբառ"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Հաստատել գաղտնաբառը"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>
            {loading ? "Սպասեք..." : "Գրանցվել"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.replace({ pathname: "auth/LoginScreen" as any })}
        >
          <Text style={styles.linkText}>Արդեն ունե՞ք հաշիվ՝ Մուտք գործել</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "rgb(22, 135, 153)",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 20,
  },
  ntitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 1,
    color: "rgb(216, 227, 228)",
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
    color: "#00798c",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
  },
  button: {
    backgroundColor: "#00798c",
    padding: 14,
    marginHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#00798c",
    fontSize: 15,
    fontWeight: "500",
  },
});
