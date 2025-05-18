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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Checkbox from "expo-checkbox";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useRouter } from "expo-router";
import HeaderWithExitModal from "../../../components/HeaderWithExitModal";
import { scale, verticalScale } from "../../utils/scale";
import FLogo from "../../../assets/flogo.svg";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const ChannelsScreen = () => {
  const insets = useSafeAreaInsets();
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
        <Image source={{ uri: item.logoUrl }}
          style={styles.logoBox}
        />
      ) : (
        <View style={styles.logoBoxPlaceholder}>
          <Text style={styles.placeholderText}>Լոգո</Text>
        </View>
      )}

      <View style={styles.channelContent}>

        <Text
          style={styles.channelTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>

        {item.description && (
          <Text
            style={styles.channelSubtitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
        <Modal visible={dropdownOpen} transparent animationType="fade" statusBarTranslucent>
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
                  paddingTop: insets.bottom,
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
        <View style={styles.grid}>
          <FlatList
            data={filteredChannels}
            renderItem={renderChannel}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
          /></View>
      </View>
    </TouchableWithoutFeedback>
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
    paddingHorizontal: scale(55),
    marginTop: scale(35),
    marginBottom: scale(60),
  },

  dropdownButton: {
    backgroundColor: "#1B90A2",
    paddingHorizontal: scale(54),
    borderRadius: scale(23),
    height: verticalScale(93),
    justifyContent: 'center'
  },

  interestText: {
    fontSize: scale(36),
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  searchInput: {
    marginLeft: scale(16),
    backgroundColor: "#fff",
    paddingHorizontal: scale(25),
    borderRadius: scale(23),
    borderColor: "#CDCDCD",
    borderWidth: scale(2),
    width: '64%',
    height: verticalScale(93),
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
    paddingHorizontal: scale(50),
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

  channelCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: verticalScale(20),
    marginRight: scale(20),
    width: '48%',
    overflow: 'hidden',
  },

  logoBox: {
    aspectRatio: 1.4,
    resizeMode: "stretch",
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
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: verticalScale(15),
    justifyContent: "center",
  },

  channelTitle: {
    fontSize: scale(30),
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
    width: '100%',
  },

  channelSubtitle: {
    fontSize: scale(26),
    color: "#666",
    width: '100%',
  },

  grid: {
    paddingHorizontal: scale(55),
  }
});
