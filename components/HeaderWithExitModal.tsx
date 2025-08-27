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
    BackHandler,
    Linking,
    ScrollView
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import FLogo from "../assets/flogo.svg";
import User from "../assets/user.svg";
import LogOut from "../assets/icons/logOut.svg";
import Email from "../assets/icons/email.svg";
import Home from "../assets/icons/home.svg";
import PrivacyPolicy from "../assets/icons/privacyPolicy.svg";
import Terms from "../assets/icons/terms.svg";
import Call from "../assets/icons/call.svg";
import Addres from "../assets/icons/addres.svg";
import Close from "../assets/images/close.svg"; // ✅ Ներմուծում ենք փակման իկոնան

import { scale, verticalScale } from '../app/utils/scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HeaderWithExitModal = ({ title = "" }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();
    const [showMenuBar, setShowMenuBar] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false); // ✅ Նոր state գաղտնիության քաղաքականության համար
    const [showTermsModal, setShowTermsModal] = useState(false); // ✅ Նոր state պայմանների համար
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

    const handleOpenPrivacyPolicy = () => {
        setShowMenuBar(false);
        setShowPrivacyModal(true);
    };

    const handleOpenTermsAndConditions = () => {
        setShowMenuBar(false);
        setShowTermsModal(true);
    };
    
    const closeModal = () => {
        setShowPrivacyModal(false);
        setShowTermsModal(false);
    };

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: showMenuBar ? 0 : -SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [showMenuBar]);

    return (
        <>
            <View style={[styles.header, { paddingTop: insets.top + verticalScale(25) }]}>
                <View style={styles.logoContainer}>
                    <TouchableOpacity onPress={() => {
                        if (pathname !== "/tabs/NewsListScreen") {
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

            {/* Main Menu Modal */}
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
                        {/* Top Section */}
                        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                            <View style={styles.menuLogo}>
                                <View style={styles.menuTitle}>
                                    <FLogo width={120} height={60} />
                                    <Image source={require('../assets/ywebLogo.png')} style={styles.menuYwebLogo} />
                                </View>
                            </View>
                            <View style={styles.divider} />
                            
                            {/* Embedded Contact Information */}
                            <ScrollView style={styles.contactInfoContainer}>
                                <Text style={styles.contactHeader}>Կապ մեզ հետ</Text>
                                <View style={styles.contactItem}>
                                    <Home width={20} height={20} fill="#fff" style={styles.contactIcon} />
                                    <TouchableOpacity onPress={() => Linking.openURL('https://www.info.newslist.am/')}>
                                        <Text style={styles.contactLink}>newslist.am</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.contactItem}>
                                    <Call width={20} height={20} style={styles.contactIcon} />
                                    <TouchableOpacity onPress={() => Linking.openURL('tel:+37494197719')}>
                                        <Text style={styles.contactLink}>+374 94 197719</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.contactItem}>
                                    <Email width={20} height={20} fill="#fff" style={styles.contactIcon} />
                                    <TouchableOpacity onPress={() => Linking.openURL('mailto:yerevak@yerevak.am')}>
                                        <Text style={styles.contactLink}>yerevak@yerevak.am</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.contactItem}>
                                    <Addres width={20} height={20} style={styles.contactIcon} />
                                    <Text style={styles.contactText}>Երևան, Գարեգին Նժդեհի 3</Text>
                                </View>
                            </ScrollView>
                        </View>

                        {/* Navigation Buttons */}
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.menuItem} onPress={handleOpenPrivacyPolicy}>
                            <PrivacyPolicy width={24} height={24} style={styles.menuItemIcon} />
                            <Text style={styles.menuItemText}>Privacy Policy Գաղտնիության քաղաքականություն</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={handleOpenTermsAndConditions}>
                            <Terms width={24} height={24} style={styles.menuItemIcon} />
                            <Text style={styles.menuItemText}>Terms and Conditions/Օգտագործման պայմաններ</Text>
                        </TouchableOpacity>

                    </Animated.View >
                </TouchableOpacity >
            </Modal>

            {/* Privacy Policy Modal */}
            <Modal visible={showPrivacyModal} transparent animationType="fade" onRequestClose={closeModal}>
                <View style={styles.fullScreenOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Privacy Policy/Գաղտնիության քաղաքականություն</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Close width={20} height={20} fill="#000" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalText}>
                                **Privacy Policy for NewsList App**{"\n"}
                                **Last updated: August 27, 2025**{"\n"}
                                NewsList (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how we handle and protect your information when you use our mobile application (“App”).{"\n\n"}
                                **1. Information We Collect**{"\n"}
                                We do not require users to create an account or provide any personal information to use our App. However, to improve performance and user experience, we automatically collect certain non-personal information through third-party services.{"\n"}
                                This information includes:{"\n"}
                                **Usage Data:** Information about your interactions with our App, such as the features you use and the pages you view. This is collected for analytical purposes.{"\n"}
                                **Diagnostics Data:** Information related to errors and crashes that occur in our App, including crash logs. This helps us to improve the stability and performance of the App.{"\n"}
                                **Device Information:** Information about your device, such as the device model, operating system version, and unique device identifiers. This is used for analytics and diagnostics.{"\n\n"}
                                **2. How We Use Your Information**{"\n"}
                                The information we collect is used exclusively for the following purposes:{"\n"}
                                To monitor and analyze usage and trends to improve your experience with the App.{"\n"}
                                To improve the stability and performance of our App by identifying and fixing bugs and crashes.{"\n\n"}
                                **3. Third-Party Services**{"\n"}
                                We use Firebase, a service provided by Google, for app analytics and crash reporting. The data collected by these services helps us understand how our App is used and improve its functionality. Firebase has its own Privacy Policy, which you can review for more information.{"\n"}
                                Firebase Privacy Policy{"\n\n"}
                                **4. Data Security**{"\n"}
                                We are committed to protecting your data. The information collected is transmitted securely (encrypted in transit) and handled in accordance with industry-standard security practices provided by Firebase.{"\n\n"}
                                **5. Changes to This Privacy Policy**{"\n"}
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the App.{"\n\n"}
                                **6. Contact Us**{"\n"}
                                If you have any questions or concerns about this Privacy Policy, please contact us at:{"\n"}
                                ywebyerevak@gmail.com{"\n\n"}
                            </Text>
                            <TouchableOpacity onPress={() => Linking.openURL('https://www.privacy-policy.newslist.am/')}>
                                <Text style={styles.modalLink}>https://www.privacy-policy.newslist.am/</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Terms and Conditions Modal */}
            <Modal visible={showTermsModal} transparent animationType="fade" onRequestClose={closeModal}>
                <View style={styles.fullScreenOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Terms and Conditions/Օգտագործման պայմաններ</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Close width={20} height={20} fill="#000" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalText}>
                                **Terms and Conditions**{"\n"}
                                **Last updated: August 27, 2025**{"\n"}
                                These Terms and Conditions ("Terms") govern your use of the NewsList mobile application ("App") operated by us ("the Company"). By accessing or using the App, you agree to be bound by these Terms. If you disagree with any part of the Terms, then you may not access the App.{"\n\n"}
                                **1. Use of the App**{"\n"}
                                You must use the App in compliance with all applicable laws and regulations. You may not use the App for any unlawful purpose or in a way that could harm the Company or any third party.{"\n\n"}
                                **2. Content**{"\n"}
                                The content, including news articles, text, and images displayed within the App, is provided and managed by the Company. We are the original source and publisher of the content available through the Service.{"\n\n"}
                                **3. Intellectual Property**{"\n"}
                                The design, branding, UI/UX, logos, and trademarks within the App are the exclusive property of NewsList. Unauthorized use or duplication is strictly prohibited.{"\n\n"}
                                **4. User Conduct**{"\n"}
                                You may not tamper with the App, attempt to reverse-engineer it, or access data unlawfully.{"\n"}
                                You may not introduce viruses, malware, or engage in activities that disrupt App functionality.{"\n\n"}
                                **5. Termination**{"\n"}
                                We may terminate or suspend your access to the App at any time, without notice or liability, if you violate these Terms.{"\n\n"}
                                **6. Disclaimer of Warranties**{"\n"}
                                The App is provided "as is" and "as available." We make no warranties regarding availability, reliability, or accuracy of the App. Use the App at your own risk.{"\n\n"}
                                **7. Limitation of Liability**{"\n"}
                                To the fullest extent permitted by law, the Company shall not be liable for any indirect, incidental, special, or consequential damages arising from your use or inability to use the App.{"\n\n"}
                                **8. Changes to the Terms**{"\n"}
                                We may revise these Terms from time to time. Changes will be effective upon posting the updated Terms. Continued use of the App after changes means you accept the revised Terms.{"\n\n"}
                                **9. Governing Law**{"\n"}
                                These Terms are governed by the laws of the Republic of Armenia. Any disputes arising under these Terms shall be subject to the jurisdiction of the courts of Armenia.{"\n\n"}
                                **10. Contact Us**{"\n"}
                                If you have any questions about these Terms and Conditions, please contact us at:{"\n"}
                                ywebyerevak@gmail.com{"\n\n"}
                            </Text>
                            <TouchableOpacity onPress={() => Linking.openURL('http://www.terms-and-conditions.newslist.am/')}>
                                <Text style={styles.modalLink}>http://www.terms-and-conditions.newslist.am/</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
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
        paddingBottom: 40,
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
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(20),
    },
    menuItemIcon: {
        marginRight: scale(15),
    },
    menuItemText: {
        color: '#fff',
        fontSize: scale(18),
        fontFamily: 'Montserrat-Arm-SemiBold',
    },
    contactInfoContainer: {
      marginTop: 20,
    },
    contactHeader: {
      fontSize: 20,
      fontFamily: 'Montserrat-Arm-SemiBold',
      color: '#fff',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.5)',
      paddingBottom: 10,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    contactIcon: {
      marginRight: scale(10),
    },
    placeholderIcon: {
      width: 20,
      height: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 4,
      marginRight: scale(10),
    },
    contactLabel: {
      fontSize: 14,
      fontFamily: 'Montserrat-Arm-SemiBold',
      color: '#fff',
      marginRight: 5,
    },
    contactText: {
      fontSize: 14,
      fontFamily: 'Montserrat-Arm-Regular',
      color: '#fff',
      flexShrink: 1,
    },
    contactLink: {
      fontSize: 14,
      fontFamily: 'Montserrat-Arm-Medium',
      color: '#fff',
      textDecorationLine: 'underline',
      flexShrink: 1,
    },
    // Modal Styles
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Montserrat-Arm-SemiBold',
        color: '#000',
    },
    modalBody: {
        paddingTop: 10,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        fontFamily: 'Montserrat-Arm-Regular',
    },
    modalLink: {
        color: '#007AFF',
        textDecorationLine: 'underline',
        marginTop: 10,
        fontSize: 14,
        fontFamily: 'Montserrat-Arm-Medium',
    },
});