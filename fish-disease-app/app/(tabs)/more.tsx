import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Modal,
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const doctors = [
  {
    id: 1,
    name: 'Dr. Rahman',
    role: 'Fish Disease Specialist',
    phone: '+8801700000001',
    email: 'dr.rahman@fishcarebd.com',
    location: 'Farmgate, Dhaka, Bangladesh',
    image: require('../../assets/images/vet1.png'),
  },
  {
    id: 2,
    name: 'Dr. Karim',
    role: 'Aquaculture Health Consultant',
    phone: '+8801700000002',
    email: 'dr.karim@aquavetbd.com',
    location: 'Agrabad, Chattogram, Bangladesh',
    image: require('../../assets/images/vet2.png'),
  },
  {
    id: 3,
    name: 'Dr. Sultana',
    role: 'Shrimp and Tilapia Expert',
    phone: '+8801700000003',
    email: 'dr.sultana@shrimphealthbd.com',
    location: 'Sonadanga, Khulna, Bangladesh',
    image: require('../../assets/images/vet3.png'),
  },
  {
    id: 4,
    name: 'Dr. Hasan',
    role: 'Fish Farm Treatment Advisor',
    phone: '+8801700000004',
    email: 'dr.hasan@fishsupportbd.com',
    location: 'Shaheb Bazar, Rajshahi, Bangladesh',
    image: require('../../assets/images/vet4.png'),
  },
];

const PREMIUM_FEE = 1000;
const PAYMENT_ACCOUNT_NUMBER = '01712345678';

export default function MoreScreen() {
  const { user, isPremium, refreshUserData } = useAuth();

  const [showPremiumForm, setShowPremiumForm] = useState(false);
  const [accountNumber, setAccountNumber] = useState(PAYMENT_ACCOUNT_NUMBER);
  const [cardNumber, setCardNumber] = useState('');

  const openCall = async (phone: string) => {
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Calling is not supported on this device.');
    }
  };

  const openEmail = async (email: string) => {
    try {
      const url = `mailto:${email}?subject=Fish%20Disease%20Consultation`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'No email app found on this device.');
    }
  };

  const openMap = async (location: string) => {
    try {
      const appUrl = `geo:0,0?q=${encodeURIComponent(location)}`;
      await Linking.openURL(appUrl);
    } catch (error) {
      try {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location
        )}`;
        await Linking.openURL(webUrl);
      } catch {
        Alert.alert('Error', 'Map could not be opened.');
      }
    }
  };

  const openPremiumForm = () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in first.');
      return;
    }

    if (isPremium) {
      Alert.alert('Premium Active', 'Your premium membership is already active.');
      return;
    }

    setAccountNumber(PAYMENT_ACCOUNT_NUMBER);
    setCardNumber('');
    setShowPremiumForm(true);
  };

  const handlePremiumSubmit = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in first.');
      return;
    }

    if (!accountNumber.trim()) {
      Alert.alert('Missing field', 'Account number is required.');
      return;
    }

    if (!cardNumber.trim()) {
      Alert.alert('Missing field', 'Please enter your card number.');
      return;
    }

    if (cardNumber.trim().length < 6) {
      Alert.alert('Invalid card number', 'Please enter a valid card number.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);

      await setDoc(
        userRef,
        {
          isPremium: true,
          premiumFee: PREMIUM_FEE,
          paymentAccountNumber: accountNumber.trim(),
          submittedCardNumber: cardNumber.trim(),
          premiumActivatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await refreshUserData();
      setShowPremiumForm(false);
      setCardNumber('');

      Alert.alert(
        'Success',
        'Payment submitted successfully. Premium is now activated.'
      );
    } catch (error) {
      console.log('Premium error:', error);
      Alert.alert('Error', 'Failed to activate premium.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>More</Text>
        <Text style={styles.subHeader}>
          Vet doctors, contact details and support information
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Premium Status</Text>
          <Text style={styles.infoText}>
            {isPremium
              ? 'Your premium membership is active. You can now view vet doctor details and contact information.'
              : 'You are currently a non-premium user. Upgrade to premium to unlock vet doctor details and direct contact options.'}
          </Text>

          <TouchableOpacity
            style={[
              styles.premiumButton,
              isPremium && styles.premiumButtonDisabled,
            ]}
            onPress={openPremiumForm}
            disabled={isPremium}
          >
            <Text style={styles.premiumButtonText}>
              {isPremium ? 'Premium Activated' : 'Activate Premium'}
            </Text>
          </TouchableOpacity>
        </View>

        {isPremium ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Vet Doctors</Text>

            {doctors.map((doctor) => (
              <View key={doctor.id} style={styles.card}>
                <Image source={doctor.image} style={styles.doctorImage} />

                <View style={styles.cardContent}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorRole}>{doctor.role}</Text>

                  <Text style={styles.label}>Phone</Text>
                  <Text style={styles.value}>{doctor.phone}</Text>

                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{doctor.email}</Text>

                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value}>{doctor.location}</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => openCall(doctor.phone)}
                    >
                      <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.emailButton}
                      onPress={() => openEmail(doctor.email)}
                    >
                      <Text style={styles.emailButtonText}>Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() => openMap(doctor.location)}
                    >
                      <Text style={styles.mapButtonText}>Location</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Premium Feature Locked</Text>
            <Text style={styles.infoText}>
              Vet doctor list, phone number, email, and location access are
              available only for premium members.
            </Text>
            <Text style={styles.infoText}>
              Please activate premium to unlock these features.
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Support Information</Text>
          <Text style={styles.infoText}>
            If your fish show abnormal swimming, skin lesions, white spots, gill
            damage, swelling, or sudden death, contact a fish vet doctor as soon
            as possible.
          </Text>
          <Text style={styles.infoText}>
            Early diagnosis and treatment can help reduce disease spread and save
            more fish in the farm.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About This App</Text>
          <Text style={styles.infoText}>
            This app helps detect fish disease from images and provides disease
            name, description, treatment advice, prevention tips, and history for
            signed-in users.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showPremiumForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPremiumForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Premium Payment Form</Text>
            <Text style={styles.modalSubTitle}>
              Complete the payment details to unlock premium.
            </Text>

            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Enter account number"
              placeholderTextColor="#888"
            />

            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="Enter card number"
              placeholderTextColor="#888"
              keyboardType="number-pad"
            />

            <Text style={styles.feeText}>Fixed Fee: {PREMIUM_FEE} Tk</Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPremiumForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePremiumSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 120,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 10,
  },
  subHeader: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  doctorImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
    backgroundColor: '#EAEAEA',
  },
  cardContent: {
    padding: 14,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  doctorRole: {
    fontSize: 15,
    color: '#2F80ED',
    fontWeight: '600',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'space-between',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#2F80ED',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emailButton: {
    flex: 1,
    backgroundColor: '#EAF3FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  emailButtonText: {
    color: '#2F80ED',
    fontWeight: '700',
    fontSize: 14,
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#111111',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 23,
    marginBottom: 8,
  },
  premiumButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  premiumButtonDisabled: {
    backgroundColor: '#8FB8F5',
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 6,
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9E1EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#F9FBFD',
    marginBottom: 10,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginTop: 8,
    marginBottom: 18,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EAEFF5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});