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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
} from 'firebase/auth';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';

const PRIVACY_POLICY_URL =
  'https://saadmarjuk.github.io/fish-disease-app/privacy-policy.html';

const doctors = [
  {
    id: 1,
    name: 'DEMO DOCTOR(Dr. Rahman)',
    role: 'Fish Disease Specialist',
    phone: '+8801000000000',
    email: 'demodr.rahman@fishcarebd.com',
    location: 'Farmgate, Dhaka, Bangladesh',
    image: require('../../assets/images/vet1.png'),
  },
  {
    id: 2,
    name: 'DEMO DOCTOR(Dr. Karim)',
    role: 'Aquaculture Health Consultant',
    phone: '+8801000000000',
    email: 'demodr.karim@aquavetbd.com',
    location: 'Agrabad, Chattogram, Bangladesh',
    image: require('../../assets/images/vet2.png'),
  },
  {
    id: 3,
    name: 'DEMO DOCTOR (Dr. Sultana)',
    role: 'Shrimp and Tilapia Expert',
    phone: '+8801000000000',
    email: 'demodr.sultana@shrimphealthbd.com',
    location: 'Sonadanga, Khulna, Bangladesh',
    image: require('../../assets/images/vet3.png'),
  },
  {
    id: 4,
    name: 'DEMO DOCTOR(Dr. Hasan)',
    role: 'Fish Farm Treatment Advisor',
    phone: '+8801000000000',
    email: 'demodr.hasan@fishsupportbd.com',
    location: 'Shaheb Bazar, Rajshahi, Bangladesh',
    image: require('../../assets/images/vet4.png'),
  },
];

export default function MoreScreen() {
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const openCall = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Calling is not supported on this device.');
      }
    } catch {
      Alert.alert('Error', 'Unable to start phone call.');
    }
  };

  const openEmail = async (email: string) => {
    try {
      const url = `mailto:${email}?subject=Fish%20Disease%20Consultation`;

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No email app found on this device.');
      }
    } catch {
      Alert.alert('Error', 'Unable to open email app.');
    }
  };

  const openMap = async (location: string) => {
    try {
      const appUrl = `geo:0,0?q=${encodeURIComponent(location)}`;

      const supported = await Linking.canOpenURL(appUrl);

      if (supported) {
        await Linking.openURL(appUrl);
        return;
      }

      const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        location
      )}`;

      await Linking.openURL(webUrl);
    } catch {
      Alert.alert('Error', 'Map could not be opened.');
    }
  };

  const openPrivacyPolicy = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert(
        'Error',
        'Privacy Policy could not be opened.'
      );
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert('Error', 'No logged-in user found.');
      return;
    }

    if (!deletePassword.trim()) {
      Alert.alert(
        'Password Required',
        'Please enter your current password.'
      );
      return;
    }

    try {
      setDeletingAccount(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        deletePassword
      );

      await reauthenticateWithCredential(user, credential);

      const historyRef = collection(
        db,
        'users',
        user.uid,
        'history'
      );

      const historySnapshot = await getDocs(historyRef);

      for (const historyDocument of historySnapshot.docs) {
        await deleteDoc(historyDocument.ref);
      }

      await deleteDoc(doc(db, 'users', user.uid));

      await deleteUser(user);

      setShowDeleteModal(false);
      setDeletePassword('');

      Alert.alert(
        'Account Deleted',
        'Your account and associated data have been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      console.log('Delete account error:', error);

      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        Alert.alert(
          'Incorrect Password',
          'The password you entered is incorrect.'
        );
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Authentication Required',
          'Please log in again before deleting your account.'
        );
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert(
          'Network Error',
          'Please check your internet connection.'
        );
      } else {
        Alert.alert(
          'Error',
          'Your account could not be deleted. Please try again.'
        );
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Services</Text>

        <Text style={styles.subHeader}>
          Vet doctors, contact details and fish health support
        </Text>

        <View style={styles.freeServiceCard}>
          <Text style={styles.freeServiceTitle}>
            Demo Veterinary Support
          </Text>

          <Text style={styles.freeServiceText}>
            The profiles and contact details below are sample data
            for educational demonstration purposes only.
            They do not represent real veterinary professionals.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Vet Doctors
          </Text>

          {doctors.map((doctor) => (
            <View key={doctor.id} style={styles.card}>
              <Image
                source={doctor.image}
                style={styles.doctorImage}
              />

              <View style={styles.cardContent}>
                <Text style={styles.doctorName}>
                  {doctor.name}
                </Text>

                <Text style={styles.doctorRole}>
                  {doctor.role}
                </Text>

                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>
                  {doctor.phone}
                </Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                  {doctor.email}
                </Text>

                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>
                  {doctor.location}
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => openCall(doctor.phone)}
                  >
                    <Text style={styles.callButtonText}>
                      Call
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={() => openEmail(doctor.email)}
                  >
                    <Text style={styles.emailButtonText}>
                      Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => openMap(doctor.location)}
                  >
                    <Text style={styles.mapButtonText}>
                      Location
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Support Information
          </Text>

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
          <Text style={styles.infoTitle}>
            About This App
          </Text>

          <Text style={styles.infoText}>
            This app helps detect fish disease from images and provides disease
            name, description, treatment advice, prevention tips, and history for
            signed-in users.
          </Text>
        </View>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>
            Privacy & Data
          </Text>

          <Text style={styles.privacyText}>
            Read how this app handles account information, fish images,
            detection history, and other data.
          </Text>

          <TouchableOpacity
            style={styles.privacyButton}
            onPress={openPrivacyPolicy}
          >
            <Text style={styles.privacyButtonText}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>
            Delete Account
          </Text>

          <Text style={styles.dangerText}>
            Permanently delete your account and detection history. This action
            cannot be undone.
          </Text>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={() => {
              setDeletePassword('');
              setShowDeleteModal(true);
            }}
          >
            <Text style={styles.deleteAccountButtonText}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deletingAccount) {
            setShowDeleteModal(false);
            setDeletePassword('');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalTitle}>
              Delete Account?
            </Text>

            <Text style={styles.deleteModalText}>
              This will permanently delete your account and detection history.
              This action cannot be undone.
            </Text>

            <Text style={styles.passwordLabel}>
              Current Password
            </Text>

            <TextInput
              style={styles.passwordInput}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Enter your current password"
              placeholderTextColor="#888"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                disabled={deletingAccount}
              >
                <Text style={styles.cancelDeleteText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  deletingAccount && { opacity: 0.6 },
                ]}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>
                    Delete Permanently
                  </Text>
                )}
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

  freeServiceCard: {
    backgroundColor: '#EAF3FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },

  freeServiceTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2F80ED',
    marginBottom: 8,
  },

  freeServiceText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 23,
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

  privacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  privacyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 8,
  },

  privacyText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 14,
  },

  privacyButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  privacyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  dangerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },

  dangerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },

  dangerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 14,
  },

  deleteAccountButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  deleteAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },

  deleteModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 10,
  },

  deleteModalText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 18,
  },

  passwordLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },

  passwordInput: {
    borderWidth: 1,
    borderColor: '#D9E1EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    marginBottom: 18,
  },

  deleteModalButtons: {
    flexDirection: 'row',
  },

  cancelDeleteButton: {
    flex: 1,
    backgroundColor: '#EAEFF5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 6,
  },

  cancelDeleteText: {
    color: '#333',
    fontWeight: '700',
  },

  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 6,
  },

  confirmDeleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});