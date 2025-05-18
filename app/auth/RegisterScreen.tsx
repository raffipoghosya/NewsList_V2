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
import AlertModal from "../AlertModal";
import Check from '../../assets/icons/check.svg';
import AlertImage from '../../assets/icons/alert.svg';
import StrongPassword from '../../assets/icons/strongPassword.svg';
import ResetPassword from '../../assets/icons/resetPassword.svg';
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
  const [showAlert, setShowAlert] = useState(false);
  const [alreadyExist, setAlreadyExist] = useState(false);
  const [wrongEmail, setWrongEmail] = useState(false);
  const [strongPassword, setstrongPassword] = useState(false);
  const [fillAllFields, setFillAllFields] = useState(false);
  const [passwordsDoesntMatch, setPasswordsDoesntMatch] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setFillAllFields(true)
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsDoesntMatch(true)
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
      setShowAlert(true);
    } catch (error: any) {
      console.log("🔥 Error during register:", error);
      if (error.code === "auth/email-already-in-use") {
        setAlreadyExist(true);
      } else if (error.code === "auth/invalid-email") {
        setWrongEmail(true);
      } else if (error.code === "auth/weak-password") {
        setstrongPassword(true);
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
      <AlertModal
        visible={showAlert}
        onClose={() => {
          setShowAlert(false);
          router.replace({ pathname: "auth/LoginScreen" as any });
        }}
        title="ԳՐԱՆՑՈՒՄԸ ՀԱՋՈՂՎԵՑ"
        buttonText="Լավ"
        image={<Check width={120} height={80} color='#AFDDDE' />}
      />
      <AlertModal
        visible={alreadyExist}
        onClose={() => {
          setAlreadyExist(false);
        }}
        title="Նշված էլ-հասցեով հաշիվ արդեն գոյություն ունի"
        buttonText="Փորձել այլ էլ-հասցե"
        image={<AlertImage width={120} height={60} />}
      />
      <AlertModal
        visible={wrongEmail}
        onClose={() => {
          setWrongEmail(false);
        }}
        title="Էլ-հասցեի սխալ ձևաչափ"
        buttonText="Փորձել այլ էլ-հասցե"
        image={<AlertImage width={120} height={60} />}
      />
      <AlertModal
        visible={strongPassword}
        onClose={() => {
          setstrongPassword(false);
        }}
        title="Գաղտնաբառը պետք է պարունակի առնվազն 6 նիշ"
        buttonText="Փորձել այլ գաղտնաբառ"
        image={<StrongPassword width={200} height={80} />}
      />
      <AlertModal
        visible={fillAllFields}
        onClose={() => {
          setFillAllFields(false);
        }}
        title="Խնդրում ենք լրացնել բոլոր դաշտերը"
        buttonText="Փորձել կրկին"
        image={<AlertImage width={120} height={60} />}
      />
      <AlertModal
        visible={passwordsDoesntMatch}
        onClose={() => {
          setPasswordsDoesntMatch(false);
        }}
        title="Գաղտնաբառերը չեն համընկնում"
        buttonText="Փորձել կրկին"
        image={<ResetPassword width={120} height={60} />}
      />
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
