import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import {
  BuildingIcon,
  CalendarIcon,
  CreditCardIcon,
  BellIcon,
  FingerprintIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronRightIcon,
} from '../../components/ui/Icons';
import { OWNER_AVATAR } from '../../constants/mockAvatars';

import { AuthService } from '../../services/AuthService';
import { AppModal } from '../../components/ui/AppModal';

export default function SettingsScreen() {
  const router = useRouter();
  const [gymModalVisible, setGymModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [gymName, setGymName] = useState('GYM PAGLU');
  const [gymPhone, setGymPhone] = useState('+92 300 1234567');
  const [gymAddress, setGymAddress] = useState('Main Boulevard, Gulberg III, Lahore');

  const confirmLogout = () => {
    AuthService.logout();
    setLogoutModalVisible(false);
    router.replace('/welcome');
  };

  const handleSaveGym = () => {
    setGymModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header matching Screen 10 */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card with Ali Raza Owner Photo matching Screen 10 */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          <Image source={{ uri: OWNER_AVATAR }} style={styles.avatarImg} />
          <View style={styles.profileInfo}>
            <Text style={styles.ownerName}>Ali Raza</Text>
            <Text style={styles.ownerRole}>Gym Owner</Text>
          </View>
          <ChevronRightIcon size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Settings Menu List matching Screen 10 */}
        <View style={styles.menuCard}>
          {/* Gym Details */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setGymModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <BuildingIcon size={20} color="#64748B" />
              <Text style={styles.menuTitle}>Gym Details</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Membership Plans */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/plans' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <CalendarIcon size={20} color="#64748B" />
              <Text style={styles.menuTitle}>Membership Plans</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Payment Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/revenue/payment-status')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <CreditCardIcon size={20} color="#64748B" />
              <Text style={styles.menuTitle}>Payment Settings</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Notification Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/notifications' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <BellIcon size={20} color="#64748B" />
              <Text style={styles.menuTitle}>Notification Settings</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Biometric Device */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/biometric-device' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <FingerprintIcon size={20} color="#64748B" />
              <Text style={styles.menuTitle}>Biometric Device</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => setHelpModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <HelpCircleIcon size={20} color="#64748B" />
              <Text style={styles.menuTitle}>Help & Support</Text>
            </View>
            <ChevronRightIcon size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Log Out Button matching Screen 10 */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.7}
        >
          <LogOutIcon size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation In-Frame Modal */}
      <AppModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalCard}>
          <View style={styles.logoutIconCircle}>
            <LogOutIcon size={28} color="#DC2626" />
          </View>
          <Text style={styles.logoutModalTitle}>Log Out of GYM PAGLU?</Text>
          <Text style={styles.logoutModalSub}>
            Are you sure you want to end your current session? You will need your owner password to sign back in.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLogoutModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmLogoutBtn}
              onPress={confirmLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmLogoutBtnText}>Yes, Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>

      {/* Gym Details In-Frame Modal */}
      <AppModal
        visible={gymModalVisible}
        onClose={() => setGymModalVisible(false)}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Gym Details</Text>

          <Text style={styles.inputLabel}>Gym Name</Text>
          <TextInput
            style={styles.modalInput}
            value={gymName}
            onChangeText={setGymName}
            placeholder="GYM PAGLU"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.inputLabel}>Helpline / Phone</Text>
          <TextInput
            style={styles.modalInput}
            value={gymPhone}
            onChangeText={setGymPhone}
            placeholder="+92 300 1234567"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.modalInput}
            value={gymAddress}
            onChangeText={setGymAddress}
            placeholder="Gym Address"
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setGymModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveGym}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>

      {/* Help & Support In-Frame Modal */}
      <AppModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalCard}>
          <View style={[styles.logoutIconCircle, { backgroundColor: '#EFF6FF' }]}>
            <HelpCircleIcon size={28} color="#2563EB" />
          </View>
          <Text style={styles.logoutModalTitle}>Help & Support</Text>
          <Text style={styles.logoutModalSub}>
            Need assistance with GYM PAGLU setup, biometric machines, or billing?
          </Text>
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: Radius.md, padding: 14, marginVertical: 14, width: '100%', gap: 8 }}>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: '#334155' }}>
              📧 Email: <Text style={{ fontFamily: Fonts.bold, color: '#0F172A' }}>support@gympaglu.pk</Text>
            </Text>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: '#334155' }}>
              📞 Helpline: <Text style={{ fontFamily: Fonts.bold, color: '#0F172A' }}>+92 300 1234567</Text>
            </Text>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: '#334155' }}>
              🕒 Active Support: Mon - Sat (9:00 AM - 10:00 PM)
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, { width: '100%', marginTop: 6 }]}
            onPress={() => setHelpModalVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: '#0F172A' },
  content: { padding: 16, paddingBottom: 40 },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#E2E8F0',
  },
  profileInfo: { flex: 1 },
  ownerName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
  },
  ownerRole: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 20,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuTitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#0F172A',
  },

  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...Shadow.sm,
  },
  logoutText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#DC2626',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 24,
    ...Shadow.card,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  logoutIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  logoutModalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutModalSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmLogoutBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
