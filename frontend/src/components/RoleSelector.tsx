/**
 * RoleSelector Component
 * Allows users to select their role during registration
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserRole } from '../types';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
}) => {
  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: 'donator',
      label: 'Donator',
      description: 'I want to donate food',
    },
    {
      value: 'distributor',
      label: 'Distributor',
      description: 'I collect and distribute food',
    },
    {
      value: 'acceptor',
      label: 'Acceptor',
      description: 'I need food assistance',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Your Role</Text>
      {roles.map((role) => (
        <TouchableOpacity
          key={role.value}
          style={[
            styles.roleButton,
            selectedRole === role.value && styles.roleButtonSelected,
          ]}
          onPress={() => onRoleSelect(role.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedRole === role.value }}
        >
          <Text
            style={[
              styles.roleLabel,
              selectedRole === role.value && styles.roleLabelSelected,
            ]}
          >
            {role.label}
          </Text>
          <Text
            style={[
              styles.roleDescription,
              selectedRole === role.value && styles.roleDescriptionSelected,
            ]}
          >
            {role.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  roleButton: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  roleButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleLabelSelected: {
    color: '#4CAF50',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  roleDescriptionSelected: {
    color: '#2E7D32',
  },
});

