// components/HeaderWithExitModal.tsx

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
    BackHandler, // ✅ Հավելվածը փակելու համար
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import FLogo from "../assets/flogo.svg";
import User from "../assets/user.svg";
import LogOut from "../assets/icons/logOut.svg";
import { scale, verticalScale } from '../app/utils/scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ❌ Հեռացված են Firebase-ի և Auth-ի հետ կապված բոլոր import-ները

const SCREEN_WIDTH = Dimensions.get('window').width;

const HeaderWithExitModal = ({ title = "" }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();
    const [showMenuBar, setShowMenuBar] = useState(false);
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

    // ❌ Հեռացված են userData, handleLogout, fetchUser ֆունկցիաները և state-երը

    const handleExitApp = () => {
        BackHandler.exitApp(); // Ուղղակի փակում է հավելվածը
    };

    useEffect(() => {
        // Slide անիմացիայի տրամաբանությունը մնում է
        Animated.timing(slideAnim, {
            toValue: showMenuBar ? 0 : -SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
        // ❌ Հեռացված է fetchUser() կանչը
    }, [showMenuBar]);

    return (
        <>
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(25), }]}>
                <View style={styles.logoContainer}>
                    <TouchableOpacity onPress={() => {
                        if (pathname !== "/tabs/NewsListScreen") { // Ճանապարհը պետք է սկսվի /-ով
                            router.replace("/tabs/NewsListScreen");
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
                        {/* Վերևի մաս */}
                        <View >
                            <View style={styles.menuLogo}>
                                <View style={styles.menuTitle}>
                                    <FLogo width={120} height={60} />
                                    <Image source={require('../assets/ywebLogo.png')} style={styles.menuYwebLogo} />
                                </View>
                            </View>
                            {/* ❌ Օգտատիրոջ տվյալները (անուն, email) հեռացված են, քանի որ Auth չկա */}
                            <View style={styles.divider} />
                        </View>

                        {/* Ներքևի մաս՝ հավելվածը փակելու կոճակ */}
                       
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
        paddingBottom: 40, // Ավելացնում ենք ներքևից տարածություն
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
});