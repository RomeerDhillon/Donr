/**
 * HomeScreen Component
 * Role-based dashboard showing relevant information
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { auth } from '../config/firebase';
import { getCurrentUser } from '../services/userService';
import { getNearbyDonations } from '../services/donationsService';
import { FoodCard } from '../components/FoodCard';
import { Loader } from '../components/Loader';
import { User, Donation, UserRole } from '../types';
import { getCurrentLocation } from '../services/locationService';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading...');
  const navigation = useNavigation();

  const loadData = async () => {
    try {
      setStatusMessage('Loading your profile...');
      const userData = await getCurrentUser();
      setUser(userData);

      if (userData.role === 'distributor' || userData.role === 'acceptor') {
        try {
          setStatusMessage('Getting your location...');
          const location = await getCurrentLocation();
          setStatusMessage('Finding nearby donations...');
          const nearbyDonations = await getNearbyDonations(
            location.lat,
            location.lng,
            10
          );
          setDonations(nearbyDonations);
          setStatusMessage('');
        } catch (locationError) {
          console.warn('Location error:', locationError);
          setStatusMessage('Loading donations...');
          // Try without location
          const nearbyDonations = await getNearbyDonations();
          setDonations(nearbyDonations);
          setStatusMessage('');
        }
      } else {
        setStatusMessage('');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setStatusMessage('');
      // Show error but don't block the UI
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (loading) {
    return <Loader message={statusMessage || "Loading..."} />;
  }

  const renderDonatorView = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Welcome, {user?.name}!</Text>
      <Text style={styles.sectionDescription}>
        You're helping reduce food waste. Create a donation to get started.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('DonationForm' as never)}
        accessibilityRole="button"
        accessibilityLabel="Create new donation"
      >
        <Text style={styles.primaryButtonText}>Create Donation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDistributorView = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Available Donations</Text>
      {donations.length === 0 ? (
        <Text style={styles.emptyText}>No donations available nearby</Text>
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
    </View>
  );

  const renderAcceptorView = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Food Available Near You</Text>
      {donations.length === 0 ? (
        <Text style={styles.emptyText}>
          No food available nearby. Check back later!
        </Text>
      ) : (
        donations.map((donation) => (
          <FoodCard
            key={donation.id}
            donation={donation}
            showDistance={true}
          />
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {user?.role === 'donator' && renderDonatorView()}
        {user?.role === 'distributor' && renderDistributorView()}
        {user?.role === 'acceptor' && renderAcceptorView()}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    padding: 16,
  },
  logoutButton: {
    margin: 16,
    padding: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
  },
});

