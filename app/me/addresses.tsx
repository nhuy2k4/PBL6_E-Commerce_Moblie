import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAddresses, setPrimaryAddress, deleteAddress } from '../../services/addressService';
import type { Address } from '../../types';

export const options = { headerShown: false };

export default function AddressesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      
      const fetchData = async () => {
        if (isMounted) {
          await loadAddresses();
        }
      };
      
      fetchData();
      
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (error: any) {
      console.error('Load addresses error:', error);
      setAddresses([]);
      // Only show alert if it's not a network error during unmount
      if (error.message && !error.message.includes('Network')) {
        Alert.alert('Error', error.message || 'Failed to load addresses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (addressId: number) => {
    try {
      setUpdatingId(addressId);
      await setPrimaryAddress(addressId);
      // Reload addresses to get updated primary status
      await loadAddresses();
      Alert.alert('Success', 'Primary address updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set primary address');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (addressId: number) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingId(addressId);
              await deleteAddress(addressId);
              await loadAddresses();
              Alert.alert('Success', 'Address deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete address');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={() => router.push('/me/add-address')}>
          <Ionicons name="add-circle-outline" size={26} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No addresses yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/me/add-address')}
            >
              <Text style={styles.addButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                {address.primaryAddress && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>Primary</Text>
                  </View>
                )}

                <View style={styles.addressInfo}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.contactName}>{address.contactName || 'No Name'}</Text>
                    <Text style={styles.contactPhone}>{address.contactPhone || 'No Phone'}</Text>
                  </View>

                  <Text style={styles.addressText}>{address.fullAddress}</Text>
                  <Text style={styles.addressLocation}>
                    {address.wardName}, {address.districtName}, {address.provinceName}
                  </Text>
                </View>

                <View style={styles.addressActions}>
                  {!address.primaryAddress && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetPrimary(address.id!)}
                      disabled={updatingId === address.id}
                    >
                      {updatingId === address.id ? (
                        <ActivityIndicator size="small" color="#FF6B35" />
                      ) : (
                        <>
                          <Ionicons name="star-outline" size={18} color="#FF6B35" />
                          <Text style={styles.actionText}>Set Primary</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      router.push({
                        pathname: '/me/edit-address',
                        params: { id: address.id },
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={18} color="#007AFF" />
                    <Text style={[styles.actionText, { color: '#007AFF' }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(address.id!)}
                    disabled={updatingId === address.id}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  addressList: {
    padding: 16,
    gap: 12,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  addressInfo: {
    gap: 8,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  addressText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  addressLocation: {
    fontSize: 13,
    color: '#999',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
  },
});
