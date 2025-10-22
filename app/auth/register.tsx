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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';

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
      const result = await authService.checkContact(contact);
      Alert.alert('Thành công', result.data || 'Mã OTP đã được gửi đến ' + contact);
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
      const result = await authService.verifyOtp(contact, otp);
      Alert.alert('Thành công', result.data || 'Xác thực OTP thành công');
      setStep('info');
    } catch (error: any) {
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
      const result = await authService.register({
        contact,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      Alert.alert('Thành công', result.data || 'Đăng ký tài khoản thành công!', [
        { text: 'OK', onPress: () => router.replace('/auth/login') }
      ]);
    } catch (error: any) {
      const errorMsg = error.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Step 1: Contact Input
  const renderContactStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Đăng ký tài khoản</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Nhập email hoặc số điện thoại để nhận mã OTP
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={colors.icon} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Email hoặc số điện thoại"
          placeholderTextColor={colors.icon}
          value={contact}
          onChangeText={setContact}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.tint }]}
        onPress={handleCheckContact}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Tiếp tục</Text>
        )}
      </TouchableOpacity>
    </>
  );

  // Render Step 2: OTP Verification
  const renderOtpStep = () => (
    <>
      <TouchableOpacity onPress={() => setStep('contact')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>Xác thực OTP</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Mã OTP đã được gửi đến {contact}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={20} color={colors.icon} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Nhập mã OTP"
          placeholderTextColor={colors.icon}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.tint }]}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Xác thực</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCheckContact} disabled={isLoading}>
        <Text style={[styles.resendText, { color: colors.tint }]}>Gửi lại mã OTP</Text>
      </TouchableOpacity>
    </>
  );

  // Render Step 3: Registration Form
  const renderInfoStep = () => (
    <>
      <TouchableOpacity onPress={() => setStep('otp')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>Thông tin tài khoản</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Hoàn tất thông tin để đăng ký
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={colors.icon} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Tên đăng nhập"
          placeholderTextColor={colors.icon}
          value={formData.username}
          onChangeText={(text) => setFormData({ ...formData, username: text })}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Mật khẩu"
          placeholderTextColor={colors.icon}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor={colors.icon}
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.tint }]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {step === 'contact' && renderContactStep()}
          {step === 'otp' && renderOtpStep()}
          {step === 'info' && renderInfoStep()}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.icon }]}>
              Đã có tài khoản?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: colors.tint }]}>
                Đăng nhập ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
