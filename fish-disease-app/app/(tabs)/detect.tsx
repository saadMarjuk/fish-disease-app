import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

type FishType = 'tilapia' | 'shrimp' | 'salmon' | null;

// Put your computer local IP here
const API_BASE_URL = 'https://saad-marjuk-fish-disease-detect-app.hf.space';

export default function DetectScreen() {
  const { user } = useAuth();

  const [selectedFish, setSelectedFish] = useState<FishType>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fishOptions = [
    {
      key: 'tilapia',
      label: 'Tilapia',
      image: require('../../assets/images/tilapia.png'),
    },
    {
      key: 'shrimp',
      label: 'Shrimp',
      image: require('../../assets/images/shrimp.png'),
    },
    {
      key: 'salmon',
      label: 'Salmon',
      image: require('../../assets/images/salmon.png'),
    },
  ] as const;

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow gallery access first.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const getPredictionLabel = (data: any) => {
    return (
      data?.display_name ||
      data?.predicted_class ||
      data?.prediction ||
      data?.class_name ||
      data?.class ||
      'Unknown'
    );
  };

  const getConfidenceValue = (data: any) => {
    const raw = data?.confidence;

    if (raw === undefined || raw === null || Number.isNaN(Number(raw))) {
      return null;
    }

    const numeric = Number(raw);

    if (numeric > 1) {
      return numeric.toFixed(2);
    }

    return (numeric * 100).toFixed(2);
  };

  const saveHistory = async ({
    fishType,
    diseaseName,
    confidence,
    description,
    treatment,
    prevention,
  }: {
    fishType: string;
    diseaseName: string;
    confidence: number | null;
    description: string;
    treatment: string;
    prevention: string;
  }) => {
    if (!user) {
      console.log('No logged-in user found. History not saved.');
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'history'), {
        fishType,
        diseaseName,
        confidence,
        description,
        treatment,
        prevention,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const handleDetect = async () => {
    if (!selectedFish) {
      Alert.alert('Select fish type', 'Please select a fish first.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Upload image', 'Please choose an image first.');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const fileName = selectedImage.split('/').pop() || 'fish.jpg';
      const lowerFileName = fileName.toLowerCase();

      let fileType = 'image/jpeg';
      if (lowerFileName.endsWith('.png')) {
        fileType = 'image/png';
      } else if (
        lowerFileName.endsWith('.jpg') ||
        lowerFileName.endsWith('.jpeg')
      ) {
        fileType = 'image/jpeg';
      }

      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: fileName,
        type: fileType,
      } as any);

      const response = await fetch(`${API_BASE_URL}/predict/${selectedFish}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || data?.message || 'Prediction failed');
      }

      const diseaseName = getPredictionLabel(data);
      const confidence = getConfidenceValue(data);
      const description = data?.description || 'No description available.';
      const treatment = data?.treatment || 'No treatment advice available.';
      const prevention = data?.prevention || 'No prevention advice available.';

      let finalText = `Disease: ${diseaseName}`;

      if (confidence !== null) {
        finalText += `\nConfidence: ${confidence}%`;
      }

      finalText += `\n\nDescription:\n${description}`;
      finalText += `\n\nTreatment / Advice:\n${treatment}`;
      finalText += `\n\nPrevention:\n${prevention}`;

      await saveHistory({
        fishType: selectedFish,
        diseaseName,
        confidence: confidence !== null ? Number(confidence) : null,
        description,
        treatment,
        prevention,
      });

      setResult(finalText);
    } catch (error: any) {
      Alert.alert('Detection failed', error?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detect Fish Disease</Text>
      <Text style={styles.subtitle}>Select fish type before detection</Text>

      <View style={styles.fishRow}>
        {fishOptions.map((fish) => {
          const isSelected = selectedFish === fish.key;

          return (
            <TouchableOpacity
              key={fish.key}
              style={[styles.fishCard, isSelected && styles.selectedFishCard]}
              onPress={() => setSelectedFish(fish.key)}
              activeOpacity={0.85}
            >
              <Image source={fish.image} style={styles.fishImage} />
              <Text
                style={[
                  styles.fishLabel,
                  isSelected && styles.selectedFishLabel,
                ]}
              >
                {fish.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.previewBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <Text style={styles.previewText}>No image selected</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickImageFromGallery}
      >
        <Text style={styles.uploadButtonText}>Choose Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.detectButton, loading && styles.disabledButton]}
        onPress={handleDetect}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.detectButtonText}>Detect Disease</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Prediction Result</Text>

        {selectedFish ? (
          <Text style={styles.resultText}>Fish Type: {selectedFish}</Text>
        ) : (
          <Text style={styles.resultPlaceholder}>No fish selected</Text>
        )}

        {result ? (
          <Text style={styles.resultText}>{result}</Text>
        ) : (
          <Text style={styles.resultPlaceholder}>
            Detection result will appear here
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    marginTop: 6,
  },
  fishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  fishCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
  },
  selectedFishCard: {
    borderColor: '#2F80ED',
    backgroundColor: '#EAF3FF',
  },
  fishImage: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  fishLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedFishLabel: {
    color: '#2F80ED',
  },
  previewBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#E3EAF2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 18,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewText: {
    fontSize: 16,
    color: '#777',
  },
  uploadButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detectButton: {
    backgroundColor: '#111111',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  disabledButton: {
    opacity: 0.7,
  },
  detectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
    color: '#1E1E1E',
  },
  resultText: {
    marginBottom: 8,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  resultPlaceholder: {
    color: '#888',
    fontSize: 15,
    marginBottom: 8,
  },
});