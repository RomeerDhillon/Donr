/**
 * FoodCard Component
 * Displays donation information in a card format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Donation } from '../types';

interface FoodCardProps {
  donation: Donation;
  onPress?: () => void;
  showDistance?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  donation,
  onPress,
  showDistance = true,
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'claimed':
        return '#FF9800';
      case 'distributed':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Food donation: ${donation.foodType}, ${donation.quantity}`}
    >
      <View style={styles.header}>
        <Text style={styles.foodType}>{donation.foodType}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(donation.status) },
          ]}
        >
          <Text style={styles.statusText}>{donation.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.quantity}>Quantity: {donation.quantity}</Text>
        <Text style={styles.expiration}>
          Expires: {formatDate(donation.expirationDate)}
        </Text>
        {showDistance && donation.distance !== undefined && (
          <Text style={styles.distance}>
            {donation.distance.toFixed(1)} miles away
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  body: {
    gap: 8,
  },
  quantity: {
    fontSize: 16,
    color: '#666',
  },
  expiration: {
    fontSize: 14,
    color: '#999',
  },
  distance: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

