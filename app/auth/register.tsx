import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkContact, verifyOTP, register } from '../../services/authService';

type RegisterStep = 'contact' | 'otp' | 'info';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [step, setStep] = useState<RegisterStep>('contact');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Check contact and send OTP
  const handleCheckContact = async () => {
    if (!contact.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hoặc số điện thoại');
      return;
    }
    setIsLoading(true);
    try {
      const result = await checkContact(contact);
      Alert.alert('Thành công', result.message || 'Mã OTP đã được gửi đến ' + contact);
      setStep('otp');
    } catch (error: any) {
      const errorMsg = error.message || 'Không thể gửi OTP';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Verifying OTP with contact:', contact, 'otp:', otp);
      const result = await verifyOTP(contact, otp);
      console.log('Verify OTP result:', result);
      Alert.alert('Thành công', result.message || 'Xác thực OTP thành công');
      setStep('info');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMsg = error.message || 'Mã OTP không đúng';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Register account
  const handleRegister = async () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }
    if (formData.password.length < 4) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 4 ký tự');
      return;
    }
    setIsLoading(true);
    try {
      const result = await register({
        contact,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      const errorMsg = error.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // UI rendering for each step
  const renderContactStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Đăng ký tài khoản</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>Nhập email hoặc số điện thoại để nhận mã OTP</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Email hoặc số điện thoại"
          placeholderTextColor={colors.icon}
          value={contact}
          onChangeText={setContact}
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.tint }]}
        onPress={handleCheckContact}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Gửi mã OTP</Text>}
      </TouchableOpacity>
    </>
  );

  const renderOtpStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Xác thực OTP</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>Nhập mã OTP đã gửi đến {contact}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Mã OTP"
          placeholderTextColor={colors.icon}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.tint }]}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Xác thực OTP</Text>}
      </TouchableOpacity>
    </>
  );

  const renderInfoStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Thông tin tài khoản</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>Nhập thông tin để hoàn tất đăng ký</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Tên đăng nhập"
          placeholderTextColor={colors.icon}
          value={formData.username}
          onChangeText={(text: string) => setFormData({ ...formData, username: text })}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Mật khẩu"
          placeholderTextColor={colors.icon}
          value={formData.password}
          onChangeText={(text: string) => setFormData({ ...formData, password: text })}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.icon} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor={colors.icon}
          value={formData.confirmPassword}
          onChangeText={(text: string) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.tint }]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Đăng ký</Text>}
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'contact' && renderContactStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'info' && renderInfoStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  actionButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
