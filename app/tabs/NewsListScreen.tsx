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
import {  db } from "../../config/firebase";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WebView from "react-native-webview";


const SCREEN_WIDTH = Dimensions.get('window').width;

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [channelsMap, setChannelsMap] = useState<{ [id: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [news, setNews] = useState<{ id: string; categoryId: string; createdAt?: { seconds: number } | null; [key: string]: any }[]>([]);
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
            order: doc.data().order || 0,
          }))
          .sort((a, b) => a.order - b.order);

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

  // ✅ Նորությունները բերում և դասավորում է ըստ ամսաթվի (ամենանորը՝ սկզբում)
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "news"));
      const allNews = snapshot.docs.map(doc => ({
        id: doc.id,
        categoryId: doc.data().categoryId || "",
        createdAt: doc.data().createdAt || null, // Ensure createdAt is explicitly included
        ...doc.data(),
      }))
        .sort((a, b) => ((b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))); // Descending sort
      
      setNews(allNews);
      setFilteredNews(allNews); // ✅ Սկզբից ցուցադրվում են բոլոր նորությունները
      setLoading(false);
    };
    fetchNews();
  }, []);

  // ✅ Այս hook-ն այժմ միայն բերում է պահպանված հետաքրքրությունները՝ առանց նորությունները ֆիլտրելու
  useEffect(() => {
    const fetchUserInterests = async () => {
      try {
        const stored = await AsyncStorage.getItem("user_interests");
        const selected = stored ? JSON.parse(stored) : [];
        setSelectedInterests(selected); // Պահպանում ենք, որպեսզի մենյուի մեջ ճիշտ նշված լինեն

        const hasSelected = await AsyncStorage.getItem("interests_selected");
        if (hasSelected !== "true") {
          setShowInterestModal(true);
        }
      } catch (error) {
        console.error("Սխալ հետաքրքրությունները բեռնելիս:", error);
      }
    };

    fetchUserInterests();
  }, []); // Աշխատում է միայն մեկ անգամ

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const snapshot = await getDocs(collection(db, "news"));
        const allNews = snapshot.docs.map(doc => ({
          id: doc.id,
          categoryId: doc.data().categoryId || "",
          createdAt: doc.data().createdAt || null, // Ensure createdAt is explicitly included
          ...doc.data(),
        }));

        const isNewItem = allNews.length > news.length;

        if (isNewItem) {
            const sortedNews = allNews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setNews(sortedNews);

            // Թարմացնում ենք ցուցադրվող ցանկը՝ կիրառելով ընթացիկ ֆիլտրը
            if (selectedInterests.length > 0) {
                const filtered = sortedNews.filter(item =>
                selectedInterests.includes(item.categoryId)
                );
                setFilteredNews(filtered);
            } else {
                setFilteredNews(sortedNews);
            }
            console.log("Նորություն ավելացավ։");
        }
      } catch (error) {
        console.error("Չհաջողվեց ստուգել նորությունները:", error);
      }
    }, 30000); // 30 վայրկյանը մեկ

    return () => clearInterval(interval);
  }, [news, selectedInterests]);

  const handleSearchLive = (text: string) => {
    setSearchTerm(text);
    const lower = text.toLowerCase();
    
    // Որոնումը կատարվում է այն ցանկի վրա, որն արդեն իսկ ֆիլտրված է (կամ ֆիլտրված չէ)
    const sourceNews = selectedInterests.length > 0
        ? news.filter(item => selectedInterests.includes(item.categoryId))
        : news;

    if (text.trim() === "") {
      setFilteredNews(sourceNews);
      return;
    }

    const filtered = sourceNews.filter(item =>
      item.title?.toLowerCase().includes(lower) 
    );
    setFilteredNews(filtered);
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      Animated.timing(dropdownAnim, {
        toValue: -SCREEN_WIDTH,
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

  const handleFilter = async () => {
    setDropdownOpen(false);

    try {
      await AsyncStorage.setItem("user_interests", JSON.stringify(selectedInterests));
      await AsyncStorage.setItem("interests_selected", "true");
    } catch (err) {
      console.error("Սխալ ոլորտները պահելիս:", err);
    }

    if (selectedInterests.length === 0) {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(item => selectedInterests.includes(item.categoryId));
      setFilteredNews(filtered);
    }
  };

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
    // Պարզ HTML՝ փոփոխականներից կախվածությունը բացառելու համար
    const htmlContent = `<h1>Test PDF</h1><p>This is a test document.</p>`;
    
    try {
      console.log("1. Սկսում եմ PDF-ի ստեղծումը...");
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log("2. PDF-ը ստեղծված է։ URI:", uri);

      const newUri = FileSystem.documentDirectory + "NewsList_" + Date.now() + ".pdf";
      console.log("3. Ստեղծում եմ նոր հասցե:", newUri);

      await FileSystem.moveAsync({ from: uri, to: newUri });
      console.log("4. Ֆայլը տեղափոխված է։");

      if (await Sharing.isAvailableAsync()) {
        console.log("5. Կիսվելու հնարավորությունը հասանելի է, բացում եմ պատուհանը...");
        await Sharing.shareAsync(newUri);
        console.log("6. Կիսվելու պատուհանը փակվեց։");
      } else {
        Alert.alert("Կիսվելու հնարավորությունը հասանելի չէ։");
      }

    } catch (error) {
      // ✅ Սա մեզ ցույց կտա կոնկրետ սխալը
      console.error("Սխալ generatePDF ֆունկցիայի մեջ:", error);
      const errorMessage = error instanceof Error ? error.message : "Անհայտ սխալ";
      Alert.alert("Սխալ", "PDF ստեղծելիս կամ կիսվելիս առաջացավ սխալ: " + errorMessage);
    }
  };

  const copyNewsLink = async () => {
    const link = `https://yournewsapp.com/news/${selectedNews?.id}`;
    await Clipboard.setString(link);
    alert("Հղումը պատճենվել է։");
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderNewsItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.newsItem} onPress={() => openNews(item)}>
      <View style={styles.newsHeaderRow}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 10 }}>
          {item.channelId && channelsMap[item.channelId]?.logoUrl ? (
            <Image source={{ uri: channelsMap[item.channelId].logoUrl }} style={styles.channelLogo} />
          ) : (
            <View style={styles.channelFallback}>
              <Text style={styles.channelFallbackText}>N</Text>
            </View>
          )}
          <Text
            style={styles.channelName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.channelId && channelsMap[item.channelId]?.name
              ? channelsMap[item.channelId].name
              : "NewsList"}
          </Text>
        </View>
        <Text
          style={styles.dateText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text style={styles.newsTitle} numberOfLines={3}>{item.title}</Text>

      {item.imageUrls?.[0] && (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.newsImage} />
      )}
    </TouchableOpacity>
  );

  function fetchNews(): void {
    setLoading(true);
    getDocs(collection(db, "news"))
      .then(snapshot => {
        const allNews = snapshot.docs.map(doc => ({
          id: doc.id,
          categoryId: doc.data().categoryId || "",
          createdAt: doc.data().createdAt || null, // Ensure createdAt is explicitly included
          ...doc.data(),
        }))
            .sort((a, b) => ((b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))); // Descending sort

        setNews(allNews);
        setFilteredNews(allNews); // ✅ Սկզբից ցուցադրվում են բոլոր նորությունները
      })
      .catch(error => {
        console.error("Սխալ նորությունները բեռնելիս:", error);
      })
      .finally(() => setLoading(false));
  }

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
          keyExtractor={(item, index) => item.id + index}
          ListEmptyComponent={
            <View style={{
              alignItems: "center",
              marginTop: '25%',
            }}>
              <Text style={styles.noNewsText}>Տվյալներ չեն գտնվել</Text>
              <NoItem width={200} height={200} />
            </View>
          }
          refreshing={loading}
          onRefresh={fetchNews}
          contentContainerStyle={{ paddingBottom: 200, paddingHorizontal: scale(55) }}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />

        {selectedNews && (
          <Modal visible={true} animationType="slide" transparent={true}>
            <View style={styles.modalBackground}>
              <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                <TouchableOpacity onPress={closeNews} style={styles.modalCloseButton}>
                  <CloseIcon width={26} height={26} fill="#168799" />
                </TouchableOpacity>

                <ScrollView
                  contentContainerStyle={{ paddingBottom: 100 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[styles.newsHeaderRow, { marginBottom: 10 }]}>
                    <View style={styles.channelInfo}>
                      {selectedNews.channelId && channelsMap[selectedNews.channelId]?.logoUrl ? (
                        <Image
                          source={{ uri: channelsMap[selectedNews.channelId].logoUrl }}
                          style={styles.channelLogo}
                        />
                      ) : (
                        <View style={styles.channelFallback}>
                          <Text style={styles.channelFallbackText}>N</Text>
                        </View>
                      )}
                      <Text style={styles.channelName}>
                        {selectedNews.channelId && channelsMap[selectedNews.channelId]?.name
                          ? channelsMap[selectedNews.channelId].name
                          : "NewsList"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                  <Text style={styles.modalDate}>{formatDate(selectedNews.createdAt)}</Text>

                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={{ marginVertical: 10 }}
                  >
                    {selectedNews.imageUrls?.map((url: string, idx: number) => (
                      <Image
                        key={`img-${idx}`}
                        source={{ uri: url }}
                        style={{
                          width: Dimensions.get("window").width - 40,
                          height: 240,
                          borderRadius: 12,
                          marginRight: 30,
                          resizeMode: "cover",
                        }}
                      />
                    ))}

                    {selectedNews.youtubeUrl && (
                      <View
                        style={{
                          width: Dimensions.get("window").width - 1,
                          height: 240,
                          borderRadius: 12,
                          marginRight: 35,
                        }}
                      >
                        <WebView
                          javaScriptEnabled
                          domStorageEnabled
                          source={{
                            uri: selectedNews.youtubeUrl.replace("watch?v=", "embed/"),
                          }}
                          style={{
                            flex: 1,
                            borderRadius: 12,
                          }}
                        />
                      </View>
                    )}
                  </ScrollView>

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

// Styles remain the same
const styles = StyleSheet.create({
    content: {
      flex: 1,
      backgroundColor: '#F8F8F8',
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
    newsItem: {
      backgroundColor: "#fff",
      borderRadius: scale(22),
      padding: scale(35),
      marginBottom: verticalScale(30),
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    newsHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(25),
    },
    channelLogo: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      marginRight: scale(20),
    },
    channelFallback: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: "#E0E0E0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: scale(20),
    },
    channelFallbackText: {
      color: "#fff",
      fontWeight: "bold",
    },
    channelName: {
      fontFamily: 'Courier',
      fontSize: scale(34),
      color: "#070707",
      maxWidth: scale(400),
    },
    dateText: {
      fontSize: scale(30),
      fontWeight: '400',
      color: "#8D8D8D",
    },
    newsTitle: {
      fontFamily: 'Courier',
      fontWeight: '600',
      fontSize: scale(44),
      lineHeight: scale(48),
      textTransform: 'uppercase',
      color: "#030303",
      marginBottom: verticalScale(20),
    },
    newsImage: {
      width: "100%",
      height: verticalScale(450),
      resizeMode: "cover",
      borderRadius: scale(20),
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
      fontFamily: 'Courier',
      fontWeight: '600',
      fontSize: scale(44),
      lineHeight: scale(48),
      textTransform: 'uppercase',
      color: "#030303",
      textAlign: 'left',
      // marginBottom: 5,
      marginTop: 10,
    },
    modalContentText: {
      fontWeight: '500',
      fontSize: 18,
      color: "#555",
      marginBottom: 30,
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
    channelInfo: {
      flexDirection: "row",
      alignItems: "center",
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
      zIndex: 999,
    },
    newsContent: {
      fontSize: scale(27),
      color: "#434343",
      fontWeight: '300',
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
    empty: {
      flex: 2,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(200),
      height: '100%',
      backgroundColor: '#F8F8F8'
    }
  });