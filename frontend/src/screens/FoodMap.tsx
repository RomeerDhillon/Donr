/**
 * FoodMap Component
 * Displays donations on an interactive map
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getNearbyDonations } from '../services/donationsService';
import { getCurrentLocation } from '../services/locationService';
import { Donation } from '../types';
import { Loader } from '../components/Loader';

export const FoodMap: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Initializing map...');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setStatusMessage('Getting your location...');
      const location = await getCurrentLocation();
      setUserLocation({
        latitude: location.lat,
        longitude: location.lng,
      });

      setStatusMessage('Loading nearby donations...');
      const nearbyDonations = await getNearbyDonations(
        location.lat,
        location.lng,
        10
      );
      setDonations(nearbyDonations);
      setStatusMessage(`Found ${nearbyDonations.length} donation${nearbyDonations.length !== 1 ? 's' : ''} nearby`);
    } catch (error: any) {
      setStatusMessage('');
      Alert.alert('Error', error.message || 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userLocation) {
    return <Loader message={statusMessage || "Loading map..."} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {donations.map((donation) => (
          <Marker
            key={donation.id}
            coordinate={{
              latitude: donation.location.lat,
              longitude: donation.location.lng,
            }}
            title={donation.foodType}
            description={`${donation.quantity} - ${donation.status}`}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

