import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

type FishKey = 'tilapia' | 'salmon' | 'shrimp' | null;

export default function HomeScreen() {
  const [openFish, setOpenFish] = useState<FishKey>(null);

  const router = useRouter();
  const { logout } = useAuth();

  const fishData = [
    {
      key: 'tilapia' as const,
      name: 'Tilapia',
      image: require('../../assets/images/real-tilapia.png'),
      scientificName: 'Oreochromis niloticus',
      habitat: 'Freshwater ponds, lakes, rivers, and aquaculture systems.',
      feeding: 'Omnivorous fish that feed on algae, plankton, and small organisms.',
      importance:
        'Tilapia is one of the most widely farmed fish species because of its fast growth and market demand.',
    },
    {
      key: 'salmon' as const,
      name: 'Salmon',
      image: require('../../assets/images/real-salmon.png'),
      scientificName: 'Salmo salar',
      habitat: 'Cold water rivers and oceans; many species migrate between fresh and salt water.',
      feeding: 'Feeds on insects, crustaceans, and smaller fish.',
      importance:
        'Salmon is highly valued for nutrition, protein content, and commercial aquaculture production.',
    },
    {
      key: 'shrimp' as const,
      name: 'Shrimp',
      image: require('../../assets/images/real-shrimp.png'),
      scientificName: 'Penaeus monodon',
      habitat: 'Marine and brackish water farming environments.',
      feeding: 'Feeds on plankton, organic matter, and small aquatic particles.',
      importance:
        'Shrimp is a major export species and very important in global aquaculture industries.',
    },
  ];

  const toggleCard = (key: FishKey) => {
    setOpenFish(openFish === key ? null : key);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to log out.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroCard}>
        <Image
          source={require('../../assets/images/hero-fish.png')}
          style={styles.heroImage}
        />
        <View style={styles.heroTextBox}>
          <Text style={styles.smallTitle}>AI Fish Health</Text>
          <Text style={styles.heroTitle}>
            Let’s detect fish disease using artificial intelligent
          </Text>
          <Text style={styles.heroSubText}>
            Select a fish type, upload an image, and get disease prediction support.
          </Text>
        </View>
      </View>

      {/* Fish Details Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fish Scientific Details</Text>
        <Text style={styles.sectionSubTitle}>
          Tap the arrow to view more information
        </Text>
      </View>

      {fishData.map((fish) => {
        const isOpen = openFish === fish.key;

        return (
          <View key={fish.key} style={styles.fishCard}>
            <View style={styles.fishTopRow}>
              <Image source={fish.image} style={styles.fishImage} />

              <View style={styles.fishTextArea}>
                <Text style={styles.fishName}>{fish.name}</Text>
                <Text style={styles.scientificName}>{fish.scientificName}</Text>
              </View>

              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => toggleCard(fish.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.arrowText}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            </View>

            {isOpen && (
              <View style={styles.detailsBox}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Scientific Name: </Text>
                  {fish.scientificName}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Habitat: </Text>
                  {fish.habitat}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Feeding: </Text>
                  {fish.feeding}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Importance: </Text>
                  {fish.importance}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 180, // increased so button not hidden
    backgroundColor: '#F4F6F8',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 22,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  heroTextBox: {
    padding: 18,
  },
  smallTitle: {
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#111111',
    lineHeight: 40,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  heroSubText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  sectionSubTitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },
  fishCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    elevation: 3,
  },
  fishTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fishImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  fishTextArea: {
    flex: 1,
    marginLeft: 12,
  },
  fishName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },
  scientificName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#444444',
    fontWeight: 'bold',
  },
  detailsBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#111111',
  },

  logoutContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});