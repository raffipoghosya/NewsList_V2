import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import Checkbox from "expo-checkbox";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Props {
  visible: boolean;
  onClose: (selected: string[]) => void;
}

const InterestModal = ({ visible, onClose }: Props) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((cat) => cat !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      setErrorModalVisible(true);
      return;
    }
  
    try {
      await AsyncStorage.setItem("user_interests", JSON.stringify(selected));
      await AsyncStorage.setItem("interests_selected", "true");
  
      onClose(selected);
    } catch (error) {
      console.error("Սխալ հետաքրքրությունները պահելիս:", error);
    }
  };
  

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={styles.modal}>
          {errorModalVisible ? (
            <>
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>
                  Որպիսի շարունակենք, ընտրիր լրահոսի թեման(ները)
                </Text>
              </View>
              <View style={styles.errorFooter}>
                <TouchableOpacity
                  style={styles.errorButton}
                  onPress={() => setErrorModalVisible(false)}
                >
                  <Text style={styles.errorButtonText}>Հասկացա</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Ինչ Թեմաներով ՈՒղարկենք լրահոս</Text>
  
              <ScrollView style={styles.scroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    style={[
                      styles.item,
                      selected.includes(cat.id) && styles.itemSelected,
                    ]}
                  >
                    <Checkbox
                      value={selected.includes(cat.id)}
                      onValueChange={() => toggleCategory(cat.id)}
                      color="#034c6a"
                    />
                    <Text
                      style={[
                        styles.label,
                        selected.includes(cat.id) && styles.labelSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
  
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Գնացինք 🚀</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
  
};  

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5, 10, 20, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#034c6a",
    marginBottom: 14,
  },
  scroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f6f8",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  itemSelected: {
    backgroundColor: "#d0f2ff",
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  labelSelected: {
    fontWeight: "bold",
    color: "#00798c",
  },
  button: {
    backgroundColor: "#034c6a",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#034c6a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  errorModal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  errorContent: {
    marginBottom: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 17,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#00798c",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 18,
  },
  errorFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default InterestModal;
