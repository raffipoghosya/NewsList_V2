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
  Dimensions,
} from "react-native";
import Checkbox from "expo-checkbox";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useRouter } from "expo-router";
import HeaderWithExitModal from "../../../components/HeaderWithExitModal";
import { scale, verticalScale } from "../../utils/scale";
import FLogo from "../../../assets/flogo.svg";

const SCREEN_WIDTH = Dimensions.get('window').width;

const ChannelsScreen = () => {
  const [channels, setChannels] = useState<any[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
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
        toValue: dropdownOpen ? 0 : -SCREEN_WIDTH,
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
      onPress={() => router.push(`/tabs/channels/${item.id}` as any)}
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
      <View style={styles.searchAndDropdownContainer}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={[
            styles.dropdownButton,
          ]}
        >
          <Text
            style={[
              styles.interestText,
            ]}
          >
            Ոլորտներ
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholderTextColor="#B6B6B6"
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
      <Modal visible={dropdownOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <Animated.View
            style={[
              styles.dropdownMenu,
              {
                transform: [{ translateX: dropdownAnim }],
              },
            ]}
          >
            <ScrollView>
              <View style={styles.menuLogo}>
                <View style={styles.menuTitle}>
                  <FLogo width={120} height={60} />
                  <Image source={require('../../../assets/ywebLogo.png')} style={styles.menuYwebLogo} />
                </View>
              </View>
              <TouchableOpacity onPress={handleSelectAll}>
                <View style={styles.checkboxRow}>
                  <Checkbox
                    style={styles.checkBox}
                    value={selectedCategories.length === categories.length}
                    onValueChange={handleSelectAll}
                    color={selectedCategories.length === categories.length ? '#8BC3CC' : undefined}

                  />
                  <Text style={styles.checkboxLabel}>Բոլորը</Text>
                </View>
                <View style={styles.bolorySeparator} />
              </TouchableOpacity>

              {categories.map((cat, idx) => (
                <TouchableOpacity key={idx} onPress={() => toggleCategory(cat)}>
                  <View style={styles.checkboxRowList}>
                    <Checkbox
                      style={styles.checkBox}
                      value={selectedCategories.includes(cat)}
                      onValueChange={() => toggleCategory(cat)}
                      color={selectedCategories.includes(cat) ? '#8BC3CC' : undefined}
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
        </TouchableOpacity >

      </Modal>

      {/* Channel list */}
     <View style={[styles.grid, { flex: 1 }]}>
  <FlatList
    data={filteredChannels}
    renderItem={renderChannel}
    keyExtractor={(item) => item.id}
    numColumns={2}
    columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 1 }}
    contentContainerStyle={{ paddingBottom: verticalScale(150) }} // ✅ որպեսզի վերջի էլեմենտը չկտրվի
  />
</View>


    </View>
  );
};

export default ChannelsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  searchAndDropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: scale(35),
    marginBottom: scale(60),

  },

  searchInput: {
    marginLeft: scale(16),
    backgroundColor: "#fff",
    paddingVertical: verticalScale(28),
    paddingHorizontal: scale(25),
    borderRadius: scale(23),
    borderColor: "#CDCDCD",
    borderWidth: scale(2),
    width: '64%',
    height: verticalScale(93),
  },

  dropdownButton: {
    backgroundColor: "#1B90A2",
    paddingVertical: verticalScale(24),
    paddingHorizontal: scale(54),
    borderRadius: scale(23),
    height: verticalScale(93),

  },

  interestText: {
    fontSize: scale(36),
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },

  categoryTextActive: {
    color: "#fff", // 👉 բացված վիճակում՝ սպիտակ տեքստ
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999, // Make sure it's above
  },
  dropdownMenu: {
     width: SCREEN_WIDTH * 0.75,
     height: '100%',
     backgroundColor: '#168799',
     paddingHorizontal: scale(40),
     left: 0,
     top: 0,
     bottom: 0,
     borderTopRightRadius: scale(25),
   },
  menuTitle: {
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 0.75 - 120) / 2,
  },
  menuYwebLogo: {
    width: scale(120),
    height: verticalScale(120),

  },
  menuLogo: {
    width: SCREEN_WIDTH * 0.75,
    height: verticalScale(130),
    flexDirection: "row",
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(150),
  },
  checkBox: {
    borderRadius: scale(5),
    borderColor: '#FFFFFF',
    width: scale(42),
    height: verticalScale(42),
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxRowList: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(42),
  },
  checkboxLabel: {
    marginLeft: scale(47),
    color: "#FFFFFF",
    fontSize: scale(36),
    fontWeight: "500",
  },
  bolorySeparator: {
    marginTop: verticalScale(26),
    marginBottom: verticalScale(41),
    height: scale(3),
    backgroundColor: "#fff",
    opacity: 0.5,
  },
  filterButton: {
    marginTop: scale(50),
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  filterButtonText: {
    fontSize: scale(28),
    fontWeight: "500",
    color: '#168799',
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
  grid: {
    paddingHorizontal: scale(45),

  }
});
