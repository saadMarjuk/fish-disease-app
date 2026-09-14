import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

export default function DetailsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Fish Disease Details</Text>
      <Text style={styles.pageSubtitle}>
        Learn the common diseases and healthy classes for shrimp, tilapia, and salmon.
      </Text>

      {/* SHRIMP SECTION */}
      <View style={styles.section}>
        <Image
          source={require('../../assets/images/real-shrimp.png')}
          style={styles.heroImage}
        />
        <Text style={styles.sectionTitle}>Shrimp</Text>
        <Text style={styles.sectionText}>
          Shrimp farming is highly sensitive to viral and environmental diseases.
          Early detection helps reduce mortality and protect production.
        </Text>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>White Spot Syndrome Virus (WSSV)</Text>
          <Text style={styles.diseaseText}>
            WSSV is a severe viral disease in shrimp. It often causes white spots
            on the shell, weakness, reduced feeding, and rapid mass mortality.
            It is one of the most dangerous diseases in shrimp aquaculture.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Black Gill Disease (BG)</Text>
          <Text style={styles.diseaseText}>
            Black Gill Disease affects the gills and may cause darkened or black
            gill tissues. Infected shrimp may show breathing difficulty, stress,
            weakness, and poor growth because damaged gills reduce oxygen intake.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Healthy Shrimp</Text>
          <Text style={styles.diseaseText}>
            A healthy shrimp usually has normal body color, active swimming behavior,
            good feeding response, and no visible lesions, discoloration, or shell damage.
          </Text>
        </View>
      </View>

      {/* TILAPIA SECTION */}
      <View style={styles.section}>
        <Image
          source={require('../../assets/images/real-tilapia.png')}
          style={styles.heroImage}
        />
        <Text style={styles.sectionTitle}>Tilapia</Text>
        <Text style={styles.sectionText}>
          Tilapia is one of the most widely farmed fish species. Disease monitoring
          is important because infections can spread fast in ponds and culture systems.
        </Text>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Streptococcosis (STr)</Text>
          <Text style={styles.diseaseText}>
            Streptococcosis is a bacterial disease that commonly affects the brain,
            eyes, and internal organs. Signs may include abnormal swimming, eye problems,
            lethargy, and loss of appetite.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Parasitic Diseases (Prd)</Text>
          <Text style={styles.diseaseText}>
            Parasitic diseases are caused by external or internal parasites that weaken
            the fish. Common signs include irritation, flashing, skin damage, poor growth,
            and stress-related behavior.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Columnaris Disease (Col)</Text>
          <Text style={styles.diseaseText}>
            Columnaris is a bacterial disease that usually affects the skin, fins,
            and gills. It may appear as pale patches, fin erosion, ulcers, or gill
            damage, especially in poor water conditions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Tilapia Lake Virus (TiLV)</Text>
          <Text style={styles.diseaseText}>
            TiLV is a viral disease that can cause serious losses in tilapia farms.
            Infected fish may show skin darkening, poor appetite, abnormal swimming,
            swollen abdomen, and general weakness.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Motile Aeromonad Septicemia (MAS)</Text>
          <Text style={styles.diseaseText}>
            MAS is a bacterial infection often linked with stress and poor water quality.
            It may cause hemorrhage, ulcers, fin damage, body discoloration, and internal
            infection that weakens the fish severely.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Normal Nile Tilapia (NN)</Text>
          <Text style={styles.diseaseText}>
            A healthy Nile tilapia is active, eats normally, swims in a balanced way,
            and has clean skin, intact fins, and normal body color without visible lesions.
          </Text>
        </View>
      </View>

      {/* SALMON SECTION */}
      <View style={styles.section}>
        <Image
          source={require('../../assets/images/real-salmon.png')}
          style={styles.heroImage}
        />
        <Text style={styles.sectionTitle}>Salmon</Text>
        <Text style={styles.sectionText}>
          Salmon health is important in both hatchery and commercial farming systems.
          Early recognition of infection improves survival and stock management.
        </Text>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>General Infection (Infected Salmon)</Text>
          <Text style={styles.diseaseText}>
            General infection means the salmon shows signs of illness but without a
            specific disease label in your dataset. Common symptoms may include weakness,
            abnormal swimming, poor feeding, skin changes, or visible stress.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.diseaseTitle}>Healthy Salmon</Text>
          <Text style={styles.diseaseText}>
            A healthy salmon usually has a smooth body surface, normal coloration,
            active movement, good feeding behavior, and no visible wounds, swelling,
            or external abnormalities.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 120,
    backgroundColor: '#F4F6F8',
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginTop: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 22,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  diseaseText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
  },
});