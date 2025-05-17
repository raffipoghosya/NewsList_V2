import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SplashScreen = () => {
  const [countdown, setCountdown] = useState(7);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnersRef = collection(db, "partners");
        const q = query(partnersRef, orderBy("order"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPartners(data);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      router.replace("auth/RegisterScreen" as any);
    }, 7000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/flogo.png')} style={styles.logo} />
        <View style={styles.circle}>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {loading ? (
        <ActivityIndicator size="large" color="#168799" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={partners}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => item.link && Linking.openURL(item.link)}
              style={styles.logoContainer}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.partnerLogo} />
              ) : (
                <Text style={{ fontSize: 12, color: '#888' }}>No Image</Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.logosContainer}
        />
      )}

      <View style={styles.bottomSection}>
        <Image source={require('../../assets/Frame.png')} style={styles.bottomLogo} />
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace("auth/RegisterScreen" as any)}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height:80,
    resizeMode: 'contain',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#168799',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    height: 5,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
    borderRadius: 8,
  },
  logosContainer: {
    paddingTop: 6,
    paddingBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: '30.5%',
    aspectRatio: 1,
    margin: '1.5%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  partnerLogo: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#168799',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
