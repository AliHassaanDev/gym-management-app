import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { initDB } from '../db/database';
import { seedDatabase } from '../db/seed';
import { PaymentRepository } from '../db/repositories/PaymentRepository';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        await seedDatabase();
        PaymentRepository.refreshOverdueStatuses();
      } catch (e) {
        console.error('DB init error:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    if (fontsLoaded || fontError) {
      setup();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const content = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="members/add" />
      <Stack.Screen name="members/[id]" />
      <Stack.Screen name="revenue/payment-status" />
      <Stack.Screen name="reports/index" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings/plans" />
      <Stack.Screen name="settings/biometric-device" />
    </Stack>
  );

  // When viewing on a laptop/desktop browser, wrap in a luxury phone frame matching the design image
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webDeskBackdrop}>
        <StatusBar style="dark" />
        <View style={styles.phoneFrame}>
          {/* Phone Top Dynamic Island & Status Bar matching Screen 2 9:41 header */}
          <View style={styles.phoneTopBar}>
            <Text style={styles.phoneTime}>9:41</Text>
            <View style={styles.phoneIsland} />
            <View style={styles.phoneStatusIcons}>
              {/* Cellular Bars SVG */}
              <Svg width={16} height={12} viewBox="0 0 16 12" fill="#0F172A">
                <Rect x="1" y="9" width="2.5" height="3" rx="0.5" />
                <Rect x="5" y="6" width="2.5" height="6" rx="0.5" />
                <Rect x="9" y="3" width="2.5" height="9" rx="0.5" />
                <Rect x="13" y="0" width="2.5" height="12" rx="0.5" />
              </Svg>
              {/* Wi-Fi SVG */}
              <Svg width={15} height={12} viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round">
                <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <Path d="M12 20h.01" />
              </Svg>
              {/* Battery SVG */}
              <Svg width={22} height={11} viewBox="0 0 24 12" fill="none">
                <Rect x="1" y="1" width="19" height="10" rx="3" stroke="#0F172A" strokeWidth="1.5" />
                <Rect x="3" y="3" width="13" height="6" rx="1.5" fill="#0F172A" />
                <Path d="M22 4v4" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
            </View>
          </View>

          {/* App screens view */}
          <View style={styles.phoneInner}>{content}</View>

          {/* Bottom Home Indicator bar */}
          <View style={styles.homeIndicatorWrap}>
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </View>
    );
  }

  // Native phone view
  return (
    <>
      <StatusBar style="auto" />
      {content}
    </>
  );
}

const styles = StyleSheet.create({
  webDeskBackdrop: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
    paddingVertical: 16,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
    height: '95vh' as any,
    maxHeight: 880,
    backgroundColor: '#F8FAFC',
    borderRadius: 44,
    borderWidth: 8,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 24,
    position: 'relative',
  },
  phoneTopBar: {
    height: 40,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    zIndex: 100,
  },
  phoneTime: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  phoneIsland: {
    width: 86,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneInner: {
    flex: 1,
  },
  homeIndicatorWrap: {
    height: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
});
