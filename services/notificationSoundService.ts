import { Audio } from 'expo-av';

let soundObject: Audio.Sound | null = null;

/**
 * Khởi tạo và load file âm thanh thông báo
 * Đặt file âm thanh của bạn vào: assets/sounds/notification.mp3
 */
export async function initNotificationSound() {
  try {
    // Cấu hình audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Tạo sound object và load file
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/notification.mp3'),
      { shouldPlay: false }
    );
    
    soundObject = sound;
    console.log('🔊 Notification sound loaded successfully');
  } catch (error) {
    console.error('❌ Error loading notification sound:', error);
  }
}

/**
 * Phát âm thanh thông báo
 */
export async function playNotificationSound() {
  try {
    if (!soundObject) {
      await initNotificationSound();
    }

    if (soundObject) {
      // Rewind về đầu nếu đang phát
      await soundObject.setPositionAsync(0);
      await soundObject.playAsync();
      console.log('🔊 Playing notification sound');
    }
  } catch (error) {
    console.error('❌ Error playing notification sound:', error);
  }
}

/**
 * Dọn dẹp sound object khi không dùng nữa
 */
export async function unloadNotificationSound() {
  try {
    if (soundObject) {
      await soundObject.unloadAsync();
      soundObject = null;
      console.log('🔊 Notification sound unloaded');
    }
  } catch (error) {
    console.error('❌ Error unloading notification sound:', error);
  }
}
