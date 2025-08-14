// ✅ Ամբողջությամբ նորացված ChannelNewsScreen.tsx ըստ HomeScreen-ի կառուցվածքի

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import CloseIcon from "../../../assets/close.svg";
import ShareIcon from "../../../assets/share.svg";
import PdfIcon from "../../../assets/pdf.svg";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import HeaderWithExitModal from "../../../components/HeaderWithExitModal";
import WebView from "react-native-webview";
import { scale, verticalScale } from "../../utils/scale";
import NoItem from "../../../assets/images/noItem.svg";

const screenWidth = Dimensions.get("window").width;

const ChannelNewsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [channelName, setChannelName] = useState("Ալիք");
  const [channelLogo, setChannelLogo] = useState<string | null>(null);
  const [news, setNews] = useState<
    {
      id: string;
      title: string;
      content: string;
      createdAt: { seconds: number };
      imageUrls: string[];
      youtubeUrl: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<{
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number };
    imageUrls: string[];
    youtubeUrl: string;
  } | null>(null);

  const fetchNewsByChannel = async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);

    try {
        // Fetch Channel Details
        const channelSnap = await getDoc(doc(db, "channels", id));
        if (channelSnap.exists()) {
            const data = channelSnap.data();
            setChannelName(data.name);
            setChannelLogo(data.logoUrl);
        }

        // Fetch News
        const q = query(collection(db, "news"), where("channelId", "==", id));
        const newsSnapshot = await getDocs(q);
        const newsData = newsSnapshot.docs
            .map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    title: d.title || "",
                    content: d.content || "",
                    createdAt: d.createdAt || { seconds: 0 },
                    imageUrls: d.imageUrls || [],
                    youtubeUrl: d.youtubeUrl || "",
                };
            })
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        setNews(newsData);
    } catch (error) {
        console.error("Error fetching channel news:", error);
        Alert.alert("Սխալ", "Տվյալները բեռնելիս առաջացավ սխալ։");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsByChannel();
  }, [id]);

  const openNews = (item: any) => setSelectedNews(item);
  const closeNews = () => setSelectedNews(null);

  const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp || !timestamp.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}.${month}.${year}`;
  };

    const generatePDF = async () => {
    if (!selectedNews) return;

    // Створюємо HTML-вміст для PDF
    const htmlContent = `
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { font-size: 24px; margin-bottom: 10px; }
                    p { font-size: 16px; line-height: 1.5; }
                    img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }
                    .date { color: #555; font-size: 14px; margin-bottom: 20px; }
                    .channel { display: flex; align-items: center; margin-bottom: 20px; }
                    .logo { width: 40px; height: 40px; border-radius: 20px; margin-right: 10px; }
                </style>
            </head>
            <body>
                <div class="channel">
                    ${channelLogo ? `<img src="${channelLogo}" class="logo" />` : ''}
                    <h2>${channelName}</h2>
                </div>
                <h1>${selectedNews.title}</h1>
                <p class="date">${formatDate(selectedNews.createdAt)}</p>
                ${selectedNews.imageUrls?.[0] ? `<img src="${selectedNews.imageUrls[0]}" />` : ''}
                <p>${selectedNews.content.replace(/\n/g, '<br />')}</p>
            </body>
        </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const newUri = FileSystem.documentDirectory + `News_${selectedNews.id}.pdf`;
        await FileSystem.moveAsync({ from: uri, to: newUri });
        
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(newUri);
        } else {
            Alert.alert("Կիսվելու հնարավորությունը հասանելի չէ։");
        }
    } catch (error) {
        console.error("Սխալ generatePDF ֆունկցիայի մեջ:", error);
        const errorMessage = error instanceof Error ? error.message : "Անհայտ սխալ";
        Alert.alert("Սխալ", "PDF ստեղծելիս կամ կիսվելիս առաջացավ սխալ: " + errorMessage);
    }
  };

  const copyNewsLink = async () => {
    const link = `https://yournewsapp.com/news/${selectedNews?.id}`;
    await Clipboard.setStringAsync(link);
    alert("Հղումը պատճենվել է։");
  };

  const renderNewsItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.newsItem} onPress={() => openNews(item)}>
      <View style={styles.newsHeaderRow}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 10 }}>
          {channelLogo ? (
            <Image source={{ uri: channelLogo }} style={styles.channelLogo} />
          ) : (
            <View style={styles.channelFallback}>
              <Text style={styles.channelFallbackText}>N</Text>
            </View>
          )}
          <Text style={styles.channelName} numberOfLines={1} ellipsizeMode="tail">
            {channelName}
          </Text>
        </View>
        <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text style={styles.newsTitle} numberOfLines={3}>{item.title}</Text>

      {item.imageUrls?.[0] && (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.newsImage} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.content}>
      <HeaderWithExitModal title={channelName} />
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: scale(55), paddingBottom: 200 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.noNewsText}>Տվյալներ չեն գտնվել</Text>
            <NoItem width={200} height={200} />
          </View>
        }
        refreshing={loading}
        onRefresh={fetchNewsByChannel}
      />

      {selectedNews && (
        <Modal visible animationType="slide" transparent>
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
                      {channelLogo ? (
                        <Image source={{ uri: channelLogo }} style={styles.channelLogo} />
                      ) : (
                        <View style={styles.channelFallback}><Text style={styles.channelFallbackText}>N</Text></View>
                      )}
                      <Text style={styles.channelName}>{channelName}</Text>
                    </View>
                </View>

                <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                <Text style={styles.modalDate}>{formatDate(selectedNews.createdAt)}</Text>
                
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                  {selectedNews.imageUrls?.map((url, idx) => (
                    <Image
                      key={`img-${idx}`}
                      source={{ uri: url }}
                      style={{ 
                          width: screenWidth - 40, 
                          height: 240, 
                          borderRadius: 12, 
                          marginRight: 30, 
                          resizeMode: 'cover' 
                      }}
                    />
                  ))}
                  {selectedNews.youtubeUrl && (
                    <View style={{ width: screenWidth - 40, height: 240, borderRadius: 12, marginRight: 35 }}>
                      <WebView
                        javaScriptEnabled
                        domStorageEnabled
                        source={{ uri: selectedNews.youtubeUrl.replace("watch?v=", "embed/") }}
                        style={{ flex: 1, borderRadius: 12 }}
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
  );
};

export default ChannelNewsScreen;

// Styles from HomeScreen for consistency
const styles = StyleSheet.create({
    content: {
      flex: 1,
      backgroundColor: '#F8F8F8',
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
      fontFamily: 'Montserrat-Arm-SemiBold',
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
      fontFamily: 'Montserrat-Arm-Medium',
      fontSize: scale(37),
      lineHeight: scale(40),
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
      fontFamily: 'Montserrat-Arm-Medium',
      fontSize: scale(37),
      lineHeight: scale(33),
      textTransform: 'uppercase',
      color: "#030303",
      textAlign: 'left',
      marginBottom: 10,
    },
    modalContentText: {
      fontSize: 16,
      color: "#555",
      marginBottom: 20,
      lineHeight: 24,
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
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: verticalScale(200),
      height: '100%',
    }
});