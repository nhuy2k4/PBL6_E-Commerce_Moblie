import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save FCM token to backend
 */
export async function saveFCMTokenToBackend(fcmToken: string, userId: number): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/fcm/register`,
      {
        fcmToken,
        userId,
        deviceType: 'android',
        deviceId: null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      console.log('✅ FCM token saved to backend');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error saving FCM token to backend:', error);
    return false;
  }
}

/**
 * Delete FCM token from backend (on logout)
 */
export async function deleteFCMTokenFromBackend(fcmToken: string): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const response = await axios.delete(
      `${API_CONFIG.BASE_URL}/fcm/unregister?fcmToken=${fcmToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      console.log('✅ FCM token deleted from backend');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error deleting FCM token from backend:', error);
    return false;
  }
}
