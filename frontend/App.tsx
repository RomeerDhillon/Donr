/**
 * Donr App Entry Point
 * Main application component with navigation and auth state management
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { Loader } from './src/components/Loader';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DonationForm } from './src/screens/DonationForm';
import { DonationList } from './src/screens/DonationList';
import { FoodMap } from './src/screens/FoodMap';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App: Initializing...');
    try {
      console.log('App: Setting up auth listener...');
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          console.log('App: Auth state changed, user:', user ? user.email : 'null');
          setUser(user);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('App: Auth state error:', error);
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.error('App: Initialization error:', err);
      setError(err.message || 'Failed to initialize app');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Loader message="Initializing..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Check your Firebase configuration and network connection.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Donr' }}
            />
            <Stack.Screen
              name="DonationForm"
              component={DonationForm}
              options={{ title: 'Create Donation' }}
            />
            <Stack.Screen
              name="DonationList"
              component={DonationList}
              options={{ title: 'Available Donations' }}
            />
            <Stack.Screen
              name="FoodMap"
              component={FoodMap}
              options={{ title: 'Food Map' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

