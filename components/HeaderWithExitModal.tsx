import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "expo-router";
import FLogo from "../assets/flogo.svg";
import Frame from "../assets/Frame.svg";
import ChannelsScreen from '../app/channels/ChannelsScreen';

const HeaderWithExitModal = ({ title = "" }) => {
    const router = useRouter();
    const pathname = usePathname(); // 👈 ստանում ենք ընթացիկ էջի ուղին
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchUser = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, "users", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setUserData({ uid: user.uid, email: user.email, ...snap.data() });
            }
        };

        fetchUser();
    }, []);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Նկարի թույլտվությունը անհրաժեշտ է։");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const image = result.assets[0].uri;

            setUserData((prev: any) => ({ ...prev, avatar: image }));

            const docRef = doc(db, "users", userData.uid);
            await updateDoc(docRef, {
                avatar: image,
            });
        }
    };

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace({ pathname: "/NewsListScreen" } as any)}>
                    <FLogo width={90} height={50} style={styles.flogo} />
                </TouchableOpacity>

                <View style={styles.headerTitleWrapper}>
                    <Text style={styles.title}>{title}</Text>
                </View>

                <TouchableOpacity onPress={() => setShowExitConfirm(true)}>
                    <Frame width={40} height={30} style={styles.frameLogo} />
                </TouchableOpacity>
            </View>

            {/* ✅ Ավելացված կոճակների բաժին */}


            {showExitConfirm && (
                <Modal transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            {userData && (
                                <>
                                    <TouchableOpacity onPress={pickImage}>
                                        {userData.avatar ? (
                                            <Image
                                                source={{ uri: userData.avatar }}
                                                style={styles.avatar}
                                            />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={{ color: "#888" }}>Ավատար</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <Text style={styles.userName}>
                                        {`${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
                                            "Անուն Ազգանուն"}
                                    </Text>

                                    <Text style={styles.userEmail}>{userData.email}</Text>
                                </>
                            )}

                            <Text style={styles.modalText}>դուրս գալ էջից՞</Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        setShowExitConfirm(false);
                                        router.replace("/SplashScreen" as any);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Դուրս գալ</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                                    onPress={() => setShowExitConfirm(false)}
                                >
                                    <Text style={[styles.modalButtonText, { color: "#333" }]}>
                                        Չեղարկել
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        pathname === "/NewsListScreen" && styles.activeButton,
                    ]}
                    onPress={() => router.replace("/NewsListScreen")}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            pathname === "/NewsListScreen.tsx" && styles.activeButtonText,
                        ]}
                    >
                        ԻՄ ԼՐԱՀՈՍ
                    </Text>
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity
                    style={[styles.button, pathname === "/channels/ChannelsScreen" && styles.activeButton,]}
                    onPress={() => router.replace("/channels/ChannelsScreen")}
                >
                    <Text style={[styles.buttonText, pathname === "/channels/ChannelsScreen" && styles.activeButtonText,]}>
                        ԱԼԻՔՆԵՐ
                    </Text>
                </TouchableOpacity>


            </View>
        </>
    );
};

export default HeaderWithExitModal;

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#168799",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 12,
        position: "relative",
    },
    frameLogo: {
        width: 40,
        height: 30,
    },
    flogo: {
        width: 90,
        height: 50,
    },
    headerTitleWrapper: {
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        backgroundColor: "#fff",
    },
    buttonText: {
        fontSize: 16,
        color: "#168799",
        fontWeight: "600",
    },
    activeButton: {
        backgroundColor: "#034c6a",
    },
    activeButtonText: {
        color: "#fff",
    },
    separator: {
        width: 1,
        backgroundColor: "#00798c",
        marginHorizontal: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalBox: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "85%",
        alignItems: "center",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: "#777",
        marginBottom: 16,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: "#168799",
        marginHorizontal: 10,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});
