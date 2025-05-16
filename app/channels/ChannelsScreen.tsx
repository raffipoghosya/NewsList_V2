import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Animated,
  ScrollView,
  Modal,
} from "react-native";
import Checkbox from "expo-checkbox";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useRouter } from "expo-router";
import HeaderWithExitModal from "../../components/HeaderWithExitModal";

const ChannelsScreen = () => {
  const [channels, setChannels] = useState<any[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(-300)).current;
  const router = useRouter();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      const snapshot = await getDocs(query(collection(db, "channels"), orderBy("order")));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { description?: string }) }));
      setChannels(data);
      setFilteredChannels(data);

      const descSet = new Set<string>();
      data.forEach((ch) => ch.description && descSet.add(ch.description));
      setCategories(Array.from(descSet));
    };
    fetchChannels();
  }, []);

  const toggleDropdown = () => {
    if (dropdownOpen) {
      Animated.timing(dropdownAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setDropdownOpen(false));
    } else {
      setDropdownOpen(true);
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  const handleFilter = () => {
    const filtered = channels.filter(ch =>
      selectedCategories.length === 0 || selectedCategories.includes(ch.description)
    );
    setFilteredChannels(filtered);
    toggleDropdown();
  };

  const renderChannel = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.channelCard}
      onPress={() => router.push(`/channels/${item.id}` as any)}
    >
      {item.logoUrl ? (
        <Image source={{ uri: item.logoUrl }} style={styles.logoBox} />
      ) : (
        <View style={styles.logoBoxPlaceholder}>
          <Text style={styles.placeholderText}>Լոգո</Text>
        </View>
      )}

      <View style={styles.channelContent}>
        <Text style={styles.channelTitle}>{item.name}</Text>
        {item.description && <Text style={styles.channelSubtitle}>{item.description}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderWithExitModal title="" />
      {/* Search + Dropdown Button */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={[
            styles.categoryButton,
            dropdownOpen && styles.categoryButton, // ✅ եթե բաց է՝ հավելում է գույն
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              dropdownOpen && styles.categoryText, // ✅ տեքստի գույնը փոխում ենք էլի
            ]}
          >
            Ոլորտներ
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Որոնել "
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            const filtered = channels.filter(channel =>
              channel.name?.toLowerCase().includes(text.toLowerCase()) ||
              channel.description?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredChannels(filtered);
          }}
        />
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <Animated.View style={[styles.dropdownMenu, { left: dropdownAnim }]}>
          <ScrollView>
            <TouchableOpacity onPress={handleSelectAll}>
              <View style={styles.checkboxRow}>
                <Checkbox
                  value={selectedCategories.length === categories.length}
                  onValueChange={handleSelectAll}
                />
                <Text style={styles.checkboxLabel}>Բոլորը</Text>
              </View>
              <View style={styles.bolorySeparator} />
            </TouchableOpacity>

            {categories.map((cat, idx) => (
              <TouchableOpacity key={idx} onPress={() => toggleCategory(cat)}>
                <View style={styles.checkboxRow}>
                  <Checkbox
                    value={selectedCategories.includes(cat)}
                    onValueChange={() => toggleCategory(cat)}
                  />
                  <Text style={styles.checkboxLabel}>{cat}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={handleFilter} style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Դիտել</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}

      {/* Channel list */}
      <FlatList
        data={filteredChannels}
        renderItem={renderChannel}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 1 }} // Adjust spacing
        contentContainerStyle={{ paddingBottom: 3 }}
      />
    </View>
  );
};

export default ChannelsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  searchContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 10,
  },

  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    width: "58%", // 👉 աջում որոնման դաշտը
    height: 44,
  },
  categoryButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  categoryButtonActive: {
    backgroundColor: "#034c6a", // 👉 երբ dropdown բաց է՝ կապույտ ֆոն
    borderColor: "#034c6a",
  },

  categoryText: {
    fontSize: 14,
    color: "#333",
  },

  categoryTextActive: {
    color: "#fff", // 👉 բացված վիճակում՝ սպիտակ տեքստ
  },

  dropdownMenu: {
    position: "absolute",
    top: 228, // 👉 սա է vertical դիրքը: փոխի՝ օրինակ 200, եթե dropdown-ը մի քիչ ավելի ցած ուզես
    zIndex: 999,
    backgroundColor: "#168799",
    padding: 15,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    width: 320, // 👉 սա է dropdown-ի լայնությունը. փոխի՝ օրինակ 300, եթե ավելի լայն ուզում ես
    height: "85%", // 👉 սա բարձրությունն է: Կարաս փոխես, օրինակ՝ "75%" կամ կոնկրետ թվով՝ 500
  },
  
  checkboxRow: {
    flexDirection: "row",
    color: "#ffffff",
    alignItems: "center",
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 8, // 👉 սա է checkbox-ների միջև vertical spacing-ը
  },
  checkboxLabel: {
    marginLeft: 10, // 👉 checkbox-ից հետո տեքստի հորիզոնական հեռավորություն
    color: "#ffffff",
    // backgroundColor: "#ffffff",
    fontSize: 19, // 👉 սա է տառաչափը։ Կարաս դարձնես 18 կամ 19՝ մի քիչ ավելի մեծ
    fontWeight: "600", // 👉 սա է հաստությունը։ 400-ը ավելի բարակ է, 600-ը՝ ավելի հաստ
    marginBottom: 7, // 👉 տողերի միջեւ հեռավորություն
  },
  bolorySeparator: {
    height: 1,
    backgroundColor: "#fff",
    marginVertical: 8,
    opacity: 0.5,
  },
  filterButton: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  filterButtonText: {
    fontWeight: "bold",
    color: "#034c6a",
  },

  // NEW: Channel Card Styles (based on image you provided)
  channelCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    marginBottom: 2,
    width: "49.8%", // Այստեղ հնարավոր է փոխել այս արժեքը՝ ավելի փոքր կամ մեծ չափերի համար
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  logoBox: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
    backgroundColor: "#eee",
  },
  logoBoxPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#777",
  },
  channelContent: {
    padding: 10,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  channelSubtitle: {
    fontSize: 12,
    color: "#666",
  },
});
