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
import { Video, ResizeMode } from "expo-av";
import CloseIcon from "../../../assets/close.svg";
import ShareIcon from "../../../assets/share.svg";
import PdfIcon from "../../../assets/pdf.svg";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import HeaderWithExitModal from "../../../components/HeaderWithExitModal";


const ChannelNewsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [channelName, setChannelName] = useState("Ալիք");
  const [channelLogo, setChannelLogo] = useState(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  interface NewsItem {
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number };
    imageUrls?: string[];
    videoUrls?: string[];
  }

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      if (typeof id !== "string") {
        console.error("Invalid channel ID");
        return;
      }
      const channelRef = doc(db, "channels", id);
      const snapshot = await getDoc(channelRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setChannelName(data.name);
        setChannelLogo(data.logoUrl ?? null);
      }
    };

    const fetchNewsByChannel = async () => {
      const q = query(collection(db, "news"), where("channelId", "==", id));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          title: docData.title || "",
          content: docData.content || "",
          createdAt: docData.createdAt || { seconds: 0 },
          imageUrls: docData.imageUrls || [],
          videoUrls: docData.videoUrls || [],
        };
      });
      setNews(data);
    };

    fetchChannel();
    fetchNewsByChannel();
  }, [id]);

  const openNews = (item: NewsItem) => setSelectedNews(item);
  const closeNews = () => setSelectedNews(null);

  const formatDate = (timestamp: { seconds: number; }) => {
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
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      } else {
        Alert.alert("Info", "PDF is ready for sharing.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "An error occurred while generating the PDF.");
    }
  };

  const copyNewsLink = async () => {
    const link = `https://yournewsapp.com/news/${selectedNews?.id}`;
    await Clipboard.setStringAsync(link);
    alert("Հղումը պատճենվել է։");
  };

  const renderNews = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.newsCard} onPress={() => openNews(item)}>
      <View style={styles.newsHeader}>
        <View style={styles.channelInfo}>
          {channelLogo ? (
            <Image source={{ uri: channelLogo }} style={styles.channelLogo} />
          ) : (
            <View style={styles.channelFallback}>
              <Text style={styles.channelFallbackText}>N</Text>
            </View>
          )}
          <Text style={styles.channelName}>{channelName}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.newsTitle}>{item.title}</Text>
      {item.imageUrls?.[0] && (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.newsImage} />
      )}
      <Text style={styles.newsContent}>{item.content.substring(0, 150)}...</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderWithExitModal title={channelName} />
      <FlatList
        data={news}
        renderItem={renderNews}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      />

      {selectedNews && (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={closeNews} style={styles.modalCloseButton}>
                <CloseIcon width={26} height={26} fill="#168799" />
              </TouchableOpacity>

              <View style={styles.newsHeader}>
                <View style={styles.channelInfo}>
                  {channelLogo ? (
                    <Image source={{ uri: channelLogo }} style={styles.channelLogo} />
                  ) : (
                    <View style={styles.channelFallback}>
                      <Text style={styles.channelFallbackText}>N</Text>
                    </View>
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
                    style={{ width: 300, height: 200, marginRight: 10, borderRadius: 8 }}
                  />
                ))}
                {selectedNews.videoUrls?.map((url, idx) => (
                  <Video
                    key={`vid-${idx}`}
                    source={{ uri: url }}
                    style={{ width: 300, height: 200, marginRight: 10, borderRadius: 8 }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                ))}
              </ScrollView>

              <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  channelInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsCard: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  newsImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginTop: 10,
  },
  newsContent: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
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
  modalDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    marginLeft: 5,
    textAlign: "left",
  },
  modalContentText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
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
  },
  actionCircle: {
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    minHeight: 50,
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
  channelFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  channelFallbackText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  channelLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "cover",
  },
  channelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  dateText: {
    fontSize: 14,
    color: "#777",
    marginLeft: 10,
  },
});
