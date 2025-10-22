import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/services/nativeGoogleAuth';
import { 
  useFacebookLogin, 
  isFacebookConfigured 
} from '@/services/socialAuthService';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Facebook Login (keep web OAuth for now)
  const { response: fbResponse, promptAsync: fbPromptAsync } = useFacebookLogin();

  // Handle Facebook OAuth response
  useEffect(() => {
    const handleFacebookResponse = async () => {
      if (fbResponse?.type === 'success') {
        setIsLoading(true);
        try {
          const { authentication } = fbResponse;
          console.log('Facebook OAuth success, Access Token received');
          await loginWithFacebook(authentication!.accessToken!);
          Alert.alert('Success', 'Facebook login successful!');
          router.replace('/(tabs)');
        } catch (error: any) {
          console.error('Facebook login error:', error);
          Alert.alert('Error', error.message || 'Facebook login failed');
        } finally {
          setIsLoading(false);
        }
      } else if (fbResponse?.type === 'error') {
        Alert.alert('Error', 'Facebook login failed. Please try again.');
      }
    };
    
    handleFacebookResponse();
  }, [fbResponse, loginWithFacebook, router]);

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with username:', formData.username);
      await login(formData.username, formData.password);
      Alert.alert('Success', 'Login successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Error', error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting native Google Sign-In...');
      const idToken = await signInWithGoogle();
      
      if (idToken) {
        console.log('✅ Google ID Token received, sending to backend...');
        await loginWithGoogle(idToken);
        Alert.alert('Success', 'Google login successful!');
        router.replace('/(tabs)');
      } else {
        console.log('❌ Google Sign-In cancelled or failed');
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      Alert.alert(
        'Google Login Error', 
        error.message || 'Google login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!isFacebookConfigured()) {
      Alert.alert(
        '🔐 Facebook Login - Setup Required',
        'Facebook OAuth chưa được cấu hình.\n\n' +
        'Để kích hoạt:\n\n' +
        '1️⃣ Tạo Facebook App tại:\n   developers.facebook.com\n\n' +
        '2️⃣ Lấy App ID\n\n' +
        '3️⃣ Cập nhật FACEBOOK_CONFIG trong:\n   services/socialAuthService.ts\n\n' +
        '� Xem: HOW_TO_GET_OAUTH_CREDENTIALS.md',
        [
          { text: 'Đóng', style: 'cancel' },
          { 
            text: 'Xem hướng dẫn', 
            onPress: () => console.log('📖 See HOW_TO_GET_OAUTH_CREDENTIALS.md')
          }
        ]
      );
      return;
    }

    try {
      console.log('� Initiating Facebook OAuth flow...');
      await fbPromptAsync();
    } catch (error: any) {
      console.error('❌ Facebook OAuth error:', error);
      Alert.alert(
        'Facebook Login Error',
        error.message || 'Không thể mở Facebook login. Vui lòng thử lại.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.tint }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to SportZone</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}>
              <Ionicons name="person-outline" size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your username"
                placeholderTextColor={colors.icon}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your password"
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
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={20}
                color={colors.tint}
              />
              <Text style={[styles.rememberText, { color: colors.text }]}>
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Forgot password')}>
              <Text style={[styles.forgotText, { color: colors.tint }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.tint }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.icon + '40' }]} />
            <Text style={[styles.dividerText, { color: colors.icon }]}>or continue with</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.icon + '40' }]} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: colors.background, borderColor: colors.icon + '40' }]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={handleFacebookLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-facebook" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.icon }]}>
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={[styles.signupLink, { color: colors.tint }]}>
                Sign up now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.icon }]}>
          © 2025 SportZone. All rights reserved.
        </Text>
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
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
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputGroup: {
    marginBottom: 20,
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
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    marginLeft: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 16,
  },
});
