import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius } from '../../constants/theme';
import { ChevronLeftIcon, FingerprintIcon } from '../../components/ui/Icons';

export default function BiometricDeviceScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState(true);

  const handleToggle = () => {
    if (connected) {
      Alert.alert('Disconnect Device', 'Disconnect biometric hardware ZKTeco F18?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => setConnected(false) },
      ]);
    } else {
      setConnected(true);
      Alert.alert('Connected', 'ZKTeco F18 is now online and synchronized.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header matching Screen 12 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biometric Device</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Center Glowing Scanner matching Screen 12 */}
        <View style={styles.scannerWrapper}>
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <FingerprintIcon size={58} color={connected ? '#10B981' : '#64748B'} strokeWidth={2} />
            </View>
          </View>

          {/* Connection Status Indicator */}
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: connected ? '#10B981' : '#DC2626' }]} />
            <Text style={styles.statusText}>
              {connected ? 'Device Connected' : 'Device Disconnected'}
            </Text>
          </View>
          <Text style={styles.deviceModel}>ZKTeco F18</Text>
        </View>

        {/* Device Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>IP Address</Text>
            <Text style={styles.infoValue}>192.168.1.10</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Last Sync</Text>
            <Text style={styles.infoValue}>22 Sep 2025, 09:41 AM</Text>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomWrapper}>
          <TouchableOpacity
            style={[styles.actionBtn, !connected && styles.actionBtnConnect]}
            onPress={handleToggle}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, !connected && styles.actionBtnConnectText]}>
              {connected ? 'Disconnect' : 'Connect Device'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0F15' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#161F2E',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161F2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },

  scannerWrapper: {
    alignItems: 'center',
    marginTop: 40,
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  innerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F291E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  deviceModel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
  },

  infoCard: {
    backgroundColor: '#111827',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginTop: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  infoLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
  },
  infoValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  bottomWrapper: {
    paddingBottom: 16,
  },
  actionBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#94A3B8',
  },
  actionBtnConnect: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  actionBtnConnectText: {
    color: '#0B0F15',
    fontFamily: Fonts.bold,
  },
});
