/**
 * NavBar Component
 * Bottom navigation bar for app navigation
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface NavBarProps {
  currentScreen?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ currentScreen }) => {
  const navigation = useNavigation();

  const navItems = [
    { key: 'Home', label: 'Home', screen: 'Home' },
    { key: 'Map', label: 'Map', screen: 'FoodMap' },
    { key: 'Profile', label: 'Profile', screen: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.navItem,
            currentScreen === item.screen && styles.navItemActive,
          ]}
          onPress={() => navigation.navigate(item.screen as never)}
          accessibilityRole="button"
          accessibilityLabel={`Navigate to ${item.label}`}
        >
          <Text
            style={[
              styles.navText,
              currentScreen === item.screen && styles.navTextActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#E8F5E9',
  },
  navText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#4CAF50',
    fontWeight: '700',
  },
});

