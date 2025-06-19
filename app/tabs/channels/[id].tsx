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
  Dimensions
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
import { ResizeMode, Video } from "expo-av";
import CloseIcon from "../../../assets/close.svg";
import ShareIcon from "../../../assets/share.svg";
import PdfIcon from "../../../assets/pdf.svg";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import HeaderWithExitModal from "../../../components/HeaderWithExitModal";
import WebView from "react-native-webview";

const screenWidth = Dimensions.get("window").width;

const ChannelNewsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [channelName, setChannelName] = useState("Ալիք");
  const [channelLogo, setChannelLogo] = useState(null);
  const [news, setNews] = useState<{
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number };
    imageUrls: string[];
    videoUrls: string[];
    youtubeUrl: string;
  }[]>([]);
  const [selectedNews, setSelectedNews] = useState<{
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number };
    imageUrls: string[];
    videoUrls: string[];
    youtubeUrl: string;
  } | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      if (typeof id !== "string") return;
      const snap = await getDoc(doc(db, "channels", id));
      if (snap.exists()) {
        const data = snap.data();
        setChannelName(data.name);
        setChannelLogo(data.logoUrl);
      }
    };
    const fetchNewsByChannel = async () => {
      const q = query(collection(db, "news"), where("channelId", "==", id));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || "",
          content: d.content || "",
          createdAt: d.createdAt || { seconds: 0 },
          imageUrls: d.imageUrls || [],
          videoUrls: d.videoUrls || [],
          youtubeUrl: d.youtubeUrl || "",
        };
      }).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setNews(data);
    };
    fetchChannel();
    fetchNewsByChannel();
  }, [id]);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const openNews = (item: React.SetStateAction<{ id: string; title: string; content: string; createdAt: { seconds: number; }; imageUrls: string[]; videoUrls: string[]; youtubeUrl: string; } | null>) => setSelectedNews(item);
  const closeNews = () => setSelectedNews(null);

  const formatDate = (timestamp: { seconds: any; }) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}.${month}.${year}`;
  };

  const renderNews = ({ item }: { item: { id: string; title: string; content: string; createdAt: { seconds: number }; imageUrls: string[]; videoUrls: string[]; youtubeUrl: string } }) => (
    <TouchableOpacity style={styles.newsCard} onPress={() => openNews(item)}>
      <View style={styles.newsHeader}>
        <View style={styles.channelInfo}>
          {channelLogo ? (
            <Image source={{ uri: channelLogo }} style={styles.channelLogo} />
          ) : (
            <View style={styles.channelFallback}><Text style={styles.channelFallbackText}>N</Text></View>
          )}
          <Text style={styles.channelName}>
            {channelName.length > 18 ? `${channelName.substring(0, 18)}...` : channelName}
          </Text>

        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.newsTitle} numberOfLines={3}>{item.title}</Text>
      {item.imageUrls?.[0] && (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.newsImage} />
      )}
    </TouchableOpacity>
  );

  const generatePDF = async () => {
    const htmlContent = `<h1>${selectedNews?.title}</h1><p>${selectedNews?.content}</p>`;
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    const newUri = FileSystem.documentDirectory + `News_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: newUri });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(newUri);
    else Alert.alert("Հաղորդագրություն", "PDF ֆայլը պատրաստ է։");
  };

  const copyNewsLink = async () => {
    const link = `https://yournewsapp.com/news/${selectedNews?.id}`;
    await Clipboard.setStringAsync(link);
    alert("Հղումը պատճենվել է։");
  };

  return (
    <View style={styles.container}>
      <HeaderWithExitModal title={channelName} />
      <FlatList
        data={news}
        renderItem={renderNews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }}
      />

      {selectedNews && (
        <Modal visible animationType="slide" transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={closeNews} style={styles.modalCloseButton}>
                <CloseIcon width={26} height={26} fill="#168799" />
              </TouchableOpacity>
              <ScrollView
                contentContainerStyle={{
                  paddingBottom: 180, // ✅ ավելի մեծ padding ներքևից
                  paddingTop: 20,
                }}
                showsVerticalScrollIndicator={false}
              >

                <View style={styles.newsHeader}>
                  <View style={styles.channelInfo}>
                    {channelLogo ? (
                      <Image source={{ uri: channelLogo }} style={styles.channelLogo} />
                    ) : (
                      <View style={styles.channelFallback}><Text style={styles.channelFallbackText}>N</Text></View>
                    )}
                    <Text style={styles.channelName}>
                      {channelName.length > 22 ? `${channelName.substring(0, 22)}...` : channelName}
                    </Text>

                  </View>
                </View>
                <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                <Text style={styles.modalDate}>{formatDate(selectedNews.createdAt)}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                  {selectedNews.imageUrls?.map((url, idx) => (
                    <Image
                      key={`img-${idx}`}
                      source={{ uri: url }}
                      style={{ width: screenWidth - 40, height: 240, resizeMode: 'contain', borderRadius: 12, marginRight: 20 }}
                    />
                  ))}
                  {selectedNews.youtubeUrl && (
                    <View style={{ width: screenWidth - 40, height: 240, borderRadius: 12, marginRight: 20 }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  actionCircle: {
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    minHeight: 50,
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
  channelLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  channelFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  channelFallbackText: {
    color: "#fff",
    fontWeight: "bold",
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    color: "#777",
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
    marginVertical: 10,
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  modalDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  modalContentText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 100,
  },
});
