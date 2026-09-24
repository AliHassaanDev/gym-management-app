import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../constants/theme';
import { GymLogoIcon } from '../components/ui/Icons';
import { SPLASH_BG_IMAGE } from '../constants/mockAvatars';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: SPLASH_BG_IMAGE }}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            {/* Center Logo & Branding matching Screen 1 */}
            <View style={styles.brandWrapper}>
              <View style={styles.logoBox}>
                <GymLogoIcon size={84} color="#F59E0B" />
              </View>

              <Text style={styles.brandTitle}>GYM</Text>
              <Text style={styles.brandSubtitle}>PAGLU</Text>

              <Text style={styles.tagline}>Stronger People</Text>
              <Text style={styles.tagline}>Build Better Tomorrows</Text>
            </View>

            {/* Bottom Actions matching Screen 1 */}
            <View style={styles.bottomWrapper}>
              <TouchableOpacity
                style={styles.getStartedBtn}
                onPress={() => router.push('/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.getStartedBtnText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0D12',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 13, 18, 0.82)',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  brandWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    marginBottom: 16,
  },
  brandTitle: {
    fontFamily: Fonts.bold,
    fontSize: 38,
    color: '#FFFFFF',
    letterSpacing: 2,
    lineHeight: 40,
  },
  brandSubtitle: {
    fontFamily: Fonts.bold,
    fontSize: 44,
    color: '#F59E0B',
    letterSpacing: 3,
    lineHeight: 48,
    marginBottom: 20,
  },
  tagline: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    textAlign: 'center',
  },

  bottomWrapper: {
    width: '100%',
    paddingBottom: 16,
    gap: 12,
  },
  getStartedBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.sm,
  },
  getStartedBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  loginBtn: {
    backgroundColor: 'transparent',
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  loginBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
