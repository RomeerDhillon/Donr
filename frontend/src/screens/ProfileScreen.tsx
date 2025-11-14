/**
 * ProfileScreen Component
 * Displays and allows editing of user profile
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../config/firebase';
import { getCurrentUser, updateUserProfile } from '../services/userService';
import { getCurrentLocation } from '../services/locationService';
import { User } from '../types';
import { Loader } from '../components/Loader';

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setName(userData.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      setSaving(true);
      const location = await getCurrentLocation();
      await updateUserProfile({ location });
      Alert.alert('Success', 'Location updated successfully!');
      await loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({ name });
      Alert.alert('Success', 'Profile updated');
      await loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            accessibilityLabel="Name input"
          />
          <TouchableOpacity
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdateName}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Update name"
          >
            {saving ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Updating...</Text>
              </View>
            ) : (
              <Text style={styles.updateButtonText}>Update Name</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          {user?.location ? (
            <Text style={styles.value}>
              {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
            </Text>
          ) : (
            <Text style={styles.value}>Not set</Text>
          )}
          <TouchableOpacity
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdateLocation}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Update location"
          >
            {saving ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Getting location...</Text>
              </View>
            ) : (
              <Text style={styles.updateButtonText}>Update Location</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    minHeight: 56,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

