import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

type HistoryItem = {
  id: string;
  fishType: string;
  diseaseName: string;
  confidence: number | null;
  description: string;
  treatment: string;
  prevention: string;
  createdAt?: any;
};

export default function HistoryScreen() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return;

      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const historyRef = collection(db, 'users', user.uid, 'history');
      const q = query(historyRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: HistoryItem[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<HistoryItem, 'id'>),
          }));

          setHistory(items);
          setLoading(false);
        },
        (error) => {
          console.log('Error loading history:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [user, authLoading])
  );

  const formatDate = (createdAt: any) => {
    if (!createdAt) return 'Date unavailable';

    try {
      if (createdAt?.toDate) {
        return createdAt.toDate().toLocaleString();
      }
      return 'Date unavailable';
    } catch {
      return 'Date unavailable';
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Please log in to view history</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No detection history found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Detection History</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.diseaseName}</Text>

            <Text style={styles.metaText}>Fish Type: {item.fishType}</Text>

            <Text style={styles.metaText}>
              Confidence:{' '}
              {item.confidence !== null && item.confidence !== undefined
                ? `${item.confidence}%`
                : 'N/A'}
            </Text>

            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.bodyText}>{item.description}</Text>

            <Text style={styles.sectionTitle}>Treatment / Advice</Text>
            <Text style={styles.bodyText}>{item.treatment}</Text>

            <Text style={styles.sectionTitle}>Prevention</Text>
            <Text style={styles.bodyText}>{item.prevention}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#2F80ED',
  },
  bodyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },
});