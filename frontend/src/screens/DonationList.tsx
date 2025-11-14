/**
 * DonationList Component
 * Lists all donations for distributors (alternative view to HomeScreen)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getNearbyDonations } from '../services/donationsService';
import { getCurrentLocation } from '../services/locationService';
import { FoodCard } from '../components/FoodCard';
import { Loader } from '../components/Loader';
import { Donation } from '../types';
import { useNavigation } from '@react-navigation/native';

export const DonationList: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading donations...');
  const navigation = useNavigation();

  const loadDonations = async () => {
    try {
      setStatusMessage('Getting your location...');
      const location = await getCurrentLocation();
      setStatusMessage('Searching for nearby donations...');
      const nearbyDonations = await getNearbyDonations(
        location.lat,
        location.lng,
        10
      );
      setDonations(nearbyDonations);
      setStatusMessage('');
    } catch (error) {
      console.error('Error loading donations:', error);
      setStatusMessage('Loading donations (without location)...');
      // Try without location
      try {
        const nearbyDonations = await getNearbyDonations();
        setDonations(nearbyDonations);
        setStatusMessage('');
      } catch (err) {
        console.error('Error loading donations without location:', err);
        setStatusMessage('');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDonations();
  };

  if (loading) {
    return <Loader message={statusMessage || "Loading donations..."} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {donations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donations available nearby</Text>
          </View>
        ) : (
          donations.map((donation) => (
            <FoodCard
              key={donation.id}
              donation={donation}
              showDistance={true}
              onPress={() =>
                navigation.navigate('DonationDetails', { donation } as never)
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

