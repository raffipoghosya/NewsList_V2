import React, { useState, useEffect, useRef } from "react";
import {
  View, Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Alert,
  Clipboard,
  Dimensions,
  Keyboard,
} from "react-native";
import { auth, db } from "../../config/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import CloseIcon from "../../assets/close.svg";
import ShareIcon from "../../assets/share.svg";
import PdfIcon from "../../assets/pdf.svg";
import { Animated } from "react-native";
import Checkbox from "expo-checkbox";
import HeaderWithExitModal from "../../components/HeaderWithExitModal";
import InterestModal from "../InterestModal";
import { scale, verticalScale } from "../utils/scale";
import NoItem from "../../assets/images/noItem.svg";
import FLogo from "../../assets/flogo.svg";

const SCREEN_WIDTH = Dimensions.get('window').width;

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [channelsMap, setChannelsMap] = useState<{ [id: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [news, setNews] = useState<{ id: string; categoryId: string; createdAt?: { seconds: number }; [key: string]: any }[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const router = useRouter();
  const dropdownAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false); // մոդալը բացվում է login-ից հետո
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);





  
// components/HomeScreen.tsx
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const cats = categoriesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          order: doc.data().order || 0, // ✅ Default 0, եթե order չկա
        }))
        .sort((a, b) => a.order - b.order); // 🔄 Սորտավորում ձեռքով
      
      setCategories(cats);
    } catch (error) {
      console.error("Սխալ կատեգորիաներ բեռնելիս:", error);
    }
  };
  
  fetchCategories();
}, []);

  useEffect(() => {
    const fetchChannels = async () => {
      const snap = await getDocs(collection(db, "channels"));
      const map: any = {};
      snap.forEach(doc => {
        map[doc.id] = doc.data();
      });
      setChannelsMap(map);
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "news"));
      const allNews = snapshot.docs.map(doc => ({
        id: doc.id,
        categoryId: doc.data().categoryId || "",
        ...doc.data(),
      }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); // 🔽 Վերջինները վերև
      setNews(allNews);
      setFilteredNews(allNews);
      setLoading(false);
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const fetchUserInterests = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const interests = data.categories || [];
          const hasChosenInterests = data.interestsSelected || false;

          setSelectedInterests(interests);

          if (interests.length > 0) {
            const filtered = news.filter(item =>
              interests.includes(item.categoryId)
            );
            setFilteredNews(filtered);
          } else {
            setFilteredNews(news);
          }
          // ✅ Բացենք մոդալը միայն եթե չի ընտրել
          if (!hasChosenInterests) {
            setShowInterestModal(true);
          }
        }
      } catch (error) {
        console.error("Սխալ օգտատիրոջ հետաքրքրությունները կարդալիս:", error);
      }
    };

    fetchUserInterests();
  }, []);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const snapshot = await getDocs(collection(db, "news"));
        const allNews = snapshot.docs.map(doc => ({
          id: doc.id,
          categoryId: doc.data().categoryId || "", // Ensure categoryId is included
          ...doc.data(),
        }));

        // Համեմատում ենք՝ արդյոք կա նոր item
        const isNewItem = allNews.some(newItem =>
          !news.find(existing => existing.id === newItem.id)
        );

        if (isNewItem) {
          setNews(allNews);

          // Թարմացնենք ըստ հետաքրքրությունների
          if (selectedInterests.length > 0) {
            const filtered = allNews.filter(item =>
              selectedInterests.includes(item.categoryId)
            );
            setFilteredNews(filtered);
          } else {
            setFilteredNews(allNews);
          }

          // Ցանկանու՞մ ես այստեղ ավելացնել toast-style նոտիֆիկացիա
          console.log("Նորություն ավելացավ։");
        }
      } catch (error) {
        console.error("Չհաջողվեց ստուգել նորությունները:", error);
      }
    }, 30000); // 30 վայրկյանը մեկ

    return () => clearInterval(interval); // Մաքրում ենք ինթերվալը, երբ կոմպոնենտը դուրս է գալիս
  }, [news, selectedInterests]);

  const handleSearchLive = (text: string) => {
    setSearchTerm(text);
    if (text.trim() === "") {
      // If no search term, show news filtered by selected interests (or all if none selected)
      if (selectedInterests.length > 0) {
        setFilteredNews(news.filter(item => selectedInterests.includes(item.categoryId)));
      } else {
        setFilteredNews(news);
      }
      return;
    }

    const lower = text.toLowerCase();
    const filtered = news.filter(item =>
      (item.title?.toLowerCase().includes(lower) ||
        item.content?.toLowerCase().includes(lower)) &&
      (selectedInterests.length === 0 || selectedInterests.includes(item.categoryId))
    );
    setFilteredNews(filtered);
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      Animated.timing(dropdownAnim, {
        toValue: isDropdownOpen ? 0 : -SCREEN_WIDTH,
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

  const toggleInterest = (id: string) => {
    const newSelected = selectedInterests.includes(id)
      ? selectedInterests.filter(i => i !== id)
      : [...selectedInterests, id];
    setSelectedInterests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedInterests.length === categories.length) {
      setSelectedInterests([]);
    } else {
      setSelectedInterests(categories.map(cat => cat.id));
    }
  };

  const handleFilter = () => {
    setDropdownOpen(false);
    if (selectedInterests.length === 0) {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(item => selectedInterests.includes(item.categoryId));
      setFilteredNews(filtered);
    }
  };

  // Rest of your component remains the same...
  const openNews = (newsItem: any) => setSelectedNews(newsItem);
  const closeNews = () => setSelectedNews(null);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}.${month}.${year}`;
  };

  const generatePDF = async () => {
    const htmlContent = `<h1>${selectedNews?.title}</h1><p>${selectedNews?.content}</p>`;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const newUri = FileSystem.documentDirectory + "NewsList_" + Date.now() + ".pdf";
      await FileSystem.moveAsync({ from: uri, to: newUri });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(newUri);
      else Alert.alert("Շարունակեք", "Պատրաստ է PDF-ը՝ միայն կիսելու համար");
    } catch (error) {
      console.error("Սխալ PDF ստեղծելիս:", error);
      Alert.alert("Սխալ", "Պատահել է սխալ PDF ստեղծելու ընթացքում");
    }
  };

  const copyNewsLink = async () => {
    const link = `https://yournewsapp.com/news/${selectedNews?.id}`;
    await Clipboard.setString(link);
    alert("Հղումը պատճենվել է։");
  };



  // Extract YouTube video ID from URL
  // Ավելացրեք այս ֆունկցիան ձեր կոմպոնենտից դուրս
const extractYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
  const renderNewsItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.newsItem} onPress={() => openNews(item)}>
      <View style={styles.newsHeaderRow}>
        <View style={styles.channelInfo}>
          {item.channelId && channelsMap[item.channelId]?.logoUrl ? (
            <Image source={{ uri: channelsMap[item.channelId].logoUrl }} style={styles.channelLogo} />
          ) : (
            <View style={styles.channelFallback}>
              <Text style={styles.channelFallbackText}>N</Text>
            </View>
          )}
          <Text style={styles.channelName}>
            {item.channelId && channelsMap[item.channelId]?.name
              ? channelsMap[item.channelId].name
              : "NewsList"}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.newsTitle}>{item.title}</Text>

      {item.imageUrls?.[0] && (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.newsImage} />
      )}

      {/* <Text style={styles.newsContent}>
        {item.content.length > 200 ? item.content.substring(0, 200) + "..." : item.content}
      </Text> */}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.content}>
        <HeaderWithExitModal title="" />

        <InterestModal
          visible={showInterestModal}
          onClose={(selected) => {
            setSelectedInterests(selected);
            setFilteredNews(
              news.filter((item) => selected.includes(item.categoryId))
            );
            setShowInterestModal(false);
          }}
        />

        <View style={styles.searchAndDropdownContainer}>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
            ]}
            onPress={toggleDropdown}
          >
            <Text
              style={[
                styles.interestText,
              ]}
            >
              {selectedInterest
                ? categories.find(cat => cat.id === selectedInterest)?.name
                : "Ոլորտներ"}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Որոնել"
            placeholderTextColor="#B6B6B6"
            value={searchTerm}
            onChangeText={handleSearchLive}
          />
        </View>
        <Modal visible={isDropdownOpen} transparent animationType="fade" statusBarTranslucent>
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
                    <Image source={require('../../assets/ywebLogo.png')} style={styles.menuYwebLogo} />
                  </View>
                </View>
                <TouchableOpacity onPress={handleSelectAll}>
                  <View style={styles.checkboxRow}>
                    <Checkbox
                      style={styles.checkBox}
                      value={selectedInterests.length === categories.length}
                      onValueChange={handleSelectAll}
                      color={selectedInterests.length === categories.length ? '#8BC3CC' : undefined}

                    />
                    <Text style={styles.checkboxLabel}>Բոլորը</Text>
                  </View>
                  <View style={styles.bolorySeparator} />
                </TouchableOpacity>

                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => toggleInterest(category.id)}
                    style={[
                      styles.checkboxRowList,
                      selectedInterests.includes(category.id) && styles.checkboxRowSelected
                    ]}
                  >
                    <Checkbox
                      style={styles.checkBox}
                      value={selectedInterests.includes(category.id)}
                      onValueChange={() => toggleInterest(category.id)}
                      color={selectedInterests.includes(category.id) ? '#8BC3CC' : undefined}
                    />
                    <Text style={styles.checkboxLabel}>{category.name}</Text>
                  </TouchableOpacity>
                ))}

              <TouchableOpacity onPress={handleFilter} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Դիտել</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View >
        </TouchableOpacity >
      </Modal>

      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <View style={{
            alignItems: "center",
            marginTop: '25%',
          }}>
            <Text style={styles.noNewsText}>Տվյալներ չեն գտնվել</Text>
            <NoItem width={200} height={200} />
          </View>}
        refreshing={loading}
        onRefresh={() => { }}
      />


        {selectedNews && (
          <Modal visible={true} animationType="slide" transparent={true}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={closeNews} style={styles.modalCloseButton}>
                  <CloseIcon width={26} height={26} fill="#168799" />
                </TouchableOpacity>

                <View style={styles.newsHeaderRow}>
                  <View style={styles.channelInfo}>
                    {selectedNews.channelId && channelsMap[selectedNews.channelId]?.logoUrl ? (
                      <Image source={{ uri: channelsMap[selectedNews.channelId].logoUrl }} style={styles.channelLogo} />
                    ) : (
                      <View style={styles.channelFallback}>
                        <Text style={styles.channelFallbackText}>N</Text>
                      </View>
                    )}
                    <Text style={styles.channelName}>
                      {channelsMap[selectedNews.channelId]?.name ?? "NewsList"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                <Text style={styles.modalDate}>{formatDate(selectedNews.createdAt)}</Text>

              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {selectedNews.imageUrls?.map((url: string, idx: number) => (
                  <Image key={`img-${idx}`} source={{ uri: url }} style={{ width: 300, height: 200, marginRight: 10, borderRadius: 8 }} />
                ))}
                {selectedNews.videoUrls?.map((url: string, idx: number) => (
                  <Video
                    key={`vid-${idx}`}
                    source={{ uri: url }}
                    style={{ width: 300, height: 200, marginRight: 10, borderRadius: 8 }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                ))}
              </ScrollView>

                <ScrollView>
                  <Text style={styles.modalContentText}>{selectedNews.content}</Text>
                </ScrollView>

                <View style={styles.bottomActionButtons}>
                  <TouchableOpacity onPress={generatePDF} style={styles.actionCircle}>
                    <PdfIcon width={20} height={20} fill="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={copyNewsLink} style={styles.actionCircle}>
                    <ShareIcon width={20} height={20} fill="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </TouchableWithoutFeedback>

  );
};

export default HomeScreen;

// Your styles remain the same...
const styles = StyleSheet.create({
  content: {
    backgroundColor: '#F8F8F8',

  },
  checkboxRowSelected: {
    borderRadius: scale(5),
  },
  checkBox: {
    borderRadius: scale(5),
    borderColor: '#FFFFFF',
    width: scale(42),
    height: verticalScale(42),
  },
  searchAndDropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(55),
    marginTop: verticalScale(36),
    marginBottom: verticalScale(60),

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
  dropdownItem: {
    padding: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#e6e6e6",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999, // Make sure it's above
  },
  newsItem: {
    backgroundColor: "#fff",
    marginBottom: verticalScale(24),
    paddingVertical: verticalScale(42),
    paddingHorizontal: scale(45),
    borderRadius: scale(22),
    borderWidth: scale(1),
    borderColor: "#8D8D8D",
  },
  newsTitle: {
    fontSize: scale(33),
    fontWeight: "700",
    color: "#030303",
  },
  newsImage: {
    width: "100%",
    height: verticalScale(593),
    resizeMode: "contain",
    borderRadius: scale(20),
    marginTop: verticalScale(30),
    marginBottom: verticalScale(17),
  },
  newsContent: {
    fontSize: scale(27),
    color: "#434343",
    fontWeight: '300',
  },
  noNewsText: {
    fontSize: scale(36),
    color: "#ACACAC",
    marginBottom: scale(150),
    fontWeight: "400",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContentText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  modalDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    marginLeft: 5,
    textAlign: "left",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
    borderRadius: 30,
  },
  bottomActionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#168799",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 0,
  },
  actionCircle: {
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    minHeight: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "rgb(238, 238, 230)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
  },
  buttonIcon: {
    width: 50,
    height: 40,
  },
  channelInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelLogo: {
    width: scale(90),
    height: verticalScale(90),
    borderRadius: 50,
    marginRight: scale(20),
    borderWidth: 1,
    borderColor: "#ccc",
  },
  channelFallback: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  channelFallbackText: {
    color: "#fff",
    fontWeight: "bold",
  },
  channelName: {
    fontSize: scale(32),
    color: "#070707",
    fontWeight: "700",
  },
  dateText: {
    fontSize: scale(30),
    fontWeight: '400',
    color: "#8D8D8D",
    alignItems: "center",

  },
  newsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(36),
  },
  empty: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(200),
    height: '100%',
    backgroundColor: '#F8F8F8'
  }
});