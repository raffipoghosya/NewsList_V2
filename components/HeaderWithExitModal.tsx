import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    Animated,
    Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "expo-router";
import FLogo from "../assets/flogo.svg";
import User from "../assets/user.svg";
import Email from "../assets/icons/email.svg";
import LogOut from "../assets/icons/logOut.svg";
import ChannelsScreen from '../app/tabs/channels/ChannelsScreen';
import { scale, verticalScale } from '../app/utils/scale';
import { signOut } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HeaderWithExitModal = ({ title = "" }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname(); // 👈 ստանում ենք ընթացիկ էջի ուղին
    const [showMenuBar, setShowMenuBar] = useState(false);
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
    const [userData, setUserData] = useState<any>(null);
    const auth = getAuth();
    const db = getFirestore();
    const fetchUser = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            setUserData({ uid: user.uid, email: user.email, ...snap.data() },
            );
        }
    };
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace({ pathname: "auth/LoginScreen" } as any);

        } catch (error) {
            console.error('Error signing out:', error);
        }
    };


    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: showMenuBar ? 0 : -SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
        fetchUser();
    }, [showMenuBar]);


    return (
        <>
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(25), }]}>
                <View style={styles.logoContainer}>
                    <TouchableOpacity onPress={() => {
                        if (pathname !== "tabs/NewsListScreen") {
                            router.replace({ pathname: "tabs/NewsListScreen" } as any);
                        }
                    }}>
                        <View style={styles.flogo}>
                            <FLogo width={100} height={50} />
                        </View>
                    </TouchableOpacity>

                    <Image source={require('../assets/ywebLogo.png')} style={styles.ywebLogo} />
                </View>
                <TouchableOpacity onPress={() => setShowMenuBar(true)}>
                    <View style={styles.circle} >
                        <User width={scale(42)} height={verticalScale(51)} />
                    </View>
                </TouchableOpacity>
            </View>


            <Modal visible={showMenuBar} transparent animationType="fade" statusBarTranslucent>
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setShowMenuBar(false)}
                >
                    <Animated.View
                        style={[
                            styles.menuBar,
                            {
                                transform: [{ translateX: slideAnim }],
                                 paddingVertical: insets.bottom,
                            },
                        ]}
                    >
                        <View >
                            <View style={styles.menuLogo}>
                                <View style={styles.menuTitle}>
                                    <FLogo width={120} height={60} />
                                    <Image source={require('../assets/ywebLogo.png')} style={styles.menuYwebLogo} />
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.userInfo}>
                                <View style={styles.menuCircle} >
                                    <User width={scale(52)} height={verticalScale(63)} />
                                </View>
                                <Text style={styles.menuUserName}>{userData?.firstName} {userData?.lastName}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.emailArea}>
                                <Email width={scale(51)} height={verticalScale(39)} />
                                <Text style={styles.menuUserEmail}>{userData?.email} </Text>
                            </View>
                        </View>
                        {/* <TouchableOpacity onPress={
                            handleLogout}>
                            <View style={styles.logOut}>
                                <LogOut width={scale(55)} height={verticalScale(55)} />
                                <Text style={styles.logoutText}>Դուրս գալ</Text>
                            </View>
                        </TouchableOpacity> */}
                    </Animated.View >
                </TouchableOpacity >
            </Modal>
        </>
    );
};

export default HeaderWithExitModal;

const styles = StyleSheet.create({
    header: {
        height: verticalScale(250),
        backgroundColor: "#168799",
        flexDirection: "row",
        paddingBottom: verticalScale(50),
        paddingHorizontal: scale(50),
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        height: verticalScale(100),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    ywebLogo: {
        width: 50,
        height: 60,
        resizeMode: 'contain',
    },
    flogo: {
        marginTop: 10,
    },
    circle: {
        width: scale(90),
        height: verticalScale(90),
        borderRadius: scale(50),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
    },
    menuBar: {
        width: SCREEN_WIDTH * 0.75,
        height: '100%',
        backgroundColor: '#168799',
        paddingHorizontal: scale(50),
        left: 0,
        top: 0,
        bottom: 0,
        borderTopRightRadius: scale(25),
        justifyContent: 'space-between',
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
        marginBottom: verticalScale(80),
    },
    divider: {
        height: 1,
        backgroundColor: '#fff',
        width: '100%',
    },
    userInfo: {
        flexDirection: "row",
        alignItems: 'center',
    },
    menuCircle: {
        width: scale(120),
        height: verticalScale(120),
        borderRadius: scale(80),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: verticalScale(30),
        marginRight: scale(28),
    },
    menuUserName: {
        fontSize: scale(36),
        fontWeight: "500",
        color: "#fff",
    },
    menuUserEmail: {
        fontSize: scale(32),
        fontWeight: "400",
        color: "#FFFFFFB2",
        marginLeft: scale(51),
    },
    emailArea: {
        height: verticalScale(100),
        flexDirection: "row",
        alignItems: 'center',
    },
    logOut: {
        flexDirection: "row",
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: scale(36),
        fontWeight: '500',
        marginLeft: scale(20),

    },

    buttonText: {
        fontSize: 16,
        color: "#168799",
        fontWeight: "600",
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
