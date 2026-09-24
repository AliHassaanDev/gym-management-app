import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../constants/theme';
import { AuthService } from '../services/AuthService';
import {
  ChevronLeftIcon,
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  GymLogoIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from '../components/ui/Icons';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = AuthService.login(username, password);
      if (res.success) {
        setSuccessMessage('Welcome back, Ali Raza!');
        setTimeout(() => {
          setLoading(false);
          router.replace('/(tabs)');
        }, 500);
      } else {
        setLoading(false);
        setErrorMessage(res.error || 'Invalid credentials');
      }
    }, 400);
  };

  const fillDemo = () => {
    setUsername('owner');
    setPassword('12345678');
    setErrorMessage(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Back button */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace('/welcome')}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.topHeaderTitle}>Sign In</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Brand Logo & Welcome Text */}
          <View style={styles.brandHero}>
            <View style={styles.logoBadge}>
              <GymLogoIcon size={56} color="#F59E0B" />
            </View>
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSub}>
              Sign in as Gym Owner to manage members, revenues & biometric attendance
            </Text>
          </View>

          {/* Quick Demo Credentials Info Pill */}
          <TouchableOpacity
            style={styles.demoCard}
            onPress={fillDemo}
            activeOpacity={0.8}
          >
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO</Text>
            </View>
            <View style={styles.demoTextWrap}>
              <Text style={styles.demoUser}>User: <Text style={styles.demoCode}>owner</Text></Text>
              <Text style={styles.demoPass}>Pass: <Text style={styles.demoCode}>12345678</Text></Text>
            </View>
            <Text style={styles.demoFillHint}>Tap to fill</Text>
          </TouchableOpacity>

          {/* Error / Success banners */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <AlertCircleIcon size={18} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <CheckCircleIcon size={18} color="#10B981" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputIcon}>
                  <UserIcon size={18} color="#94A3B8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username (owner)"
                  placeholderTextColor="#64748B"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputIcon}>
                  <LockIcon size={18} color="#94A3B8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password (12345678)"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOffIcon size={18} color="#94A3B8" />
                  ) : (
                    <EyeIcon size={18} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In as Owner</Text>
              )}
            </TouchableOpacity>

            {/* Security note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityText}>
                Protected Gym Management System · Version 1.0.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0D12',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  topHeaderTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadow.sm,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  demoBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  demoBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: '#0F172A',
  },
  demoTextWrap: {
    flex: 1,
  },
  demoUser: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  demoPass: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  demoCode: {
    fontFamily: Fonts.bold,
    color: '#F59E0B',
  },
  demoFillHint: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#38BDF8',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 18,
    gap: 8,
  },
  errorText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#FCA5A5',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 18,
    gap: 8,
  },
  successText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#6EE7B7',
    flex: 1,
  },

  formContainer: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#FFFFFF',
  },
  eyeBtn: {
    padding: 8,
  },

  loginBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Shadow.sm,
  },
  loginBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },

  securityNote: {
    marginTop: 24,
    alignItems: 'center',
  },
  securityText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748B',
  },
});
