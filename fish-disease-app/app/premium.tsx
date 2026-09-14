import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function PremiumScreen() {
  const router = useRouter();
  const { refreshUserData } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Demo Payment');
  const [loading, setLoading] = useState(false);

  const amount = 1000;

  const handlePremiumUpgrade = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: true,
        premiumAmount: amount,
        paymentMethod,
        paymentName: name.trim(),
        paymentPhone: phone.trim(),
        premiumActivatedAt: new Date().toISOString(),
      });

      await refreshUserData();

      Alert.alert('Success', 'Premium activated successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/more'),
        },
      ]);
    } catch (error) {
      console.log('Premium update error:', error);
      Alert.alert('Error', 'Failed to activate premium');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Premium Upgrade</Text>
        <Text style={styles.subtitle}>
          Upgrade to premium to access the More tab
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#8A8A8A"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#8A8A8A"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          value={paymentMethod}
          editable={false}
        />

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Fixed Price</Text>
          <Text style={styles.priceValue}>1000 TK</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handlePremiumUpgrade}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Pay Now (Demo)</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 22,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6EAF0',
  },
  priceBox: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F80ED',
  },
  button: {
    backgroundColor: '#2F80ED',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});