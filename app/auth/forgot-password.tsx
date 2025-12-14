import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [step, setStep] = useState(1); // 1: send OTP, 2: verify OTP, 3: reset password
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!contact) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOtp({ contact });
      if (res && res.status === 200) {
        Alert.alert('Success', res.message || 'OTP has been sent to ' + contact);
        setStep(2);
      } else {
        Alert.alert('Error', res?.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Cannot connect to server';
      Alert.alert('Error', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyForgotPasswordOtp({ contact, otp });
      if (res && res.status === 200) {
        Alert.alert('Success', res.message || 'OTP verified successfully');
        setStep(3);
      } else {
        Alert.alert('Error', res?.message || 'Invalid OTP');
      }
    } catch (error) {
      const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Cannot connect to server';
      Alert.alert('Error', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await resetPassword({
        contact,
        otp,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });
      if (res && res.status === 200) {
        Alert.alert('Success', res.message || 'Password reset successfully', [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]);
      } else {
        Alert.alert('Error', res?.message || 'Failed to reset password');
      }
    } catch (error) {
      const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Cannot connect to server';
      Alert.alert('Error', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <Ionicons name="key" size={48} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <Text style={styles.headerSubtitle}>
          {step === 1 && 'Enter your contact to receive OTP'}
          {step === 2 && 'Verify your identity'}
          {step === 3 && 'Set your new password'}
        </Text>
      </View>
      <View style={styles.formContainer}>
        {step === 1 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>Email or Phone Number</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}>
              <Ionicons name="mail-outline" size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email or phone"
                placeholderTextColor={colors.icon}
                value={contact}
                onChangeText={setContact}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>OTP Code</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter OTP"
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
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        {step === 3 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter new password"
                placeholderTextColor={colors.icon}
                value={password}
                onChangeText={setPassword}
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
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm new password"
                placeholderTextColor={colors.icon}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.icon }]}>Remember your password?{' '}</Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={[styles.loginLink, { color: colors.tint }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  actionButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
