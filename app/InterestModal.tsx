// components/InterestModal.tsx
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
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

interface Props {
  visible: boolean;
  onClose: (selected: string[]) => void;
}

const InterestModal = ({ visible, onClose }: Props) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
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
      prev.includes(id)
        ? prev.filter((cat) => cat !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        categories: selected,
        interestsSelected: true, // ✅ Մեկ անգամ նշվում է
      });
  
      onClose(selected); // մոդալը փակում ենք
    } catch (error) {
      console.error("Սխալ պահպանման ժամանակ:", error);
    }
  };
  
  

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modal]}>
          <Text style={styles.title}>🧠 Ընտրիր քո հետաքրքրությունները</Text>

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
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default InterestModal;

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
});
