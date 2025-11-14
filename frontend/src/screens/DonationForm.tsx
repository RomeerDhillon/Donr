/**
 * DonationForm Component
 * Allows donators to create new donations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { createDonation } from '../services/donationsService';
import { getCurrentLocation } from '../services/locationService';
import { Loader } from '../components/Loader';
import { useNavigation } from '@react-navigation/native';

export const DonationForm: React.FC = () => {
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!foodType || !quantity || !expirationDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const expiration = new Date(expirationDate);
    if (isNaN(expiration.getTime())) {
      Alert.alert('Error', 'Please enter a valid date');
      return;
    }

    if (expiration < new Date()) {
      Alert.alert('Error', 'Expiration date cannot be in the past');
      return;
    }

    setLoading(true);
    setStatusMessage('Getting your location...');
    try {
      let location;
      try {
        setStatusMessage('Getting your location...');
        location = await getCurrentLocation();
        setStatusMessage('Creating donation...');
      } catch (locationError) {
        console.warn('Could not get location, using address:', locationError);
        setStatusMessage('Creating donation (without location)...');
      }

      setStatusMessage('Saving donation to database...');
      await createDonation(foodType, quantity, expiration, location, address);

      setStatusMessage('Success!');
      Alert.alert('Success', 'Donation created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      setStatusMessage('');
      Alert.alert('Error', error.message || 'Failed to create donation');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Donation</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Food Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fresh vegetables, Bread, Prepared meals"
              placeholderTextColor="#999"
              value={foodType}
              onChangeText={setFoodType}
              accessibilityLabel="Food type input"
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10 lbs, 5 boxes, 20 servings"
              placeholderTextColor="#999"
              value={quantity}
              onChangeText={setQuantity}
              accessibilityLabel="Quantity input"
            />

            <Text style={styles.label}>Expiration Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={expirationDate}
              onChangeText={setExpirationDate}
              accessibilityLabel="Expiration date input"
            />

            <Text style={styles.label}>Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address for pickup"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              multiline
              accessibilityLabel="Address input"
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Submit donation"
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>
                    {statusMessage || 'Processing...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Create Donation</Text>
              )}
            </TouchableOpacity>
            {statusMessage && !loading && (
              <Text style={styles.statusText}>{statusMessage}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 56,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
});

