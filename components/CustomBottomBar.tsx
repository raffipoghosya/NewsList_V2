import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Home from "../assets/icons/home.svg";
import { scale, verticalScale } from "../app/utils/scale";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar({
    state,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const handlePress = (routeName: string, index: number) => {
        if (state.index !== index) {
            navigation.navigate(routeName as never);
        }
    };

    return (
        <View style={styles.containerWrapper}>
            {/* Curved bump */}
            <View style={styles.bump} />

            <View style={[styles.container, {
                height: insets.bottom + verticalScale(120) || verticalScale(120),
                paddingBottom: insets.bottom + verticalScale(35) || verticalScale(100),

            }]}>
                {/* First Tab */}
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handlePress("NewsListScreen", 0)}
                >
                    <Text style={[styles.label, state.index === 0 && styles.activeLabel]}>
                        ԻՄ ԼՐԱՀՈՍ
                    </Text>
                </TouchableOpacity>

                {/* Center Icon (raised into bump) */}
                <View style={styles.centerIconWrapper}>
                    <Home width={scale(55)} height={verticalScale(45)} />
                </View>

                {/* Second Tab */}
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handlePress("channels/ChannelsScreen", 1)}
                >
                    <Text style={[styles.label, state.index === 1 && styles.activeLabel]}>
                        ԱԼԻՔՆԵՐ
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        width: "100%",
        height: verticalScale(120),
        alignItems: "center",
        borderTopLeftRadius: scale(50),
        borderTopRightRadius: scale(50),
    },
    bump: {
        position: "absolute",
        top: scale(-20),
        width: scale(139),
        height: verticalScale(139),
        borderRadius: scale(70),
        backgroundColor: "#168799",
        zIndex: 2,
    },
    container: {
        flexDirection: "row",
        backgroundColor: "#168799",
        borderTopLeftRadius: scale(50),
        borderTopRightRadius: scale(50),
        width: "100%",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: scale(20),
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: scale(36),
        color: "#fff",
        fontWeight: "500",
    },
    activeLabel: {
        fontSize: scale(36),
        color: "#A1CFD6",
        fontWeight: "500",
    },
    centerIconWrapper: {
        width: scale(65),
        height: verticalScale(55),
        marginBottom: verticalScale(20),
        top: -verticalScale(1),
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3,
        backgroundColor: "transparent",
    },
});
