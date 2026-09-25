import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../../constants/theme';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  BellIcon,
  SmartphoneIcon,
  WalletIcon,
  ClockIcon,
} from '../../components/ui/Icons';

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // Settings states
  const [dueReminders, setDueReminders] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [paymentReceipts, setPaymentReceipts] = useState(true);
  const [checkinAlerts, setCheckinAlerts] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsGateway, setSmsGateway] = useState(false);
  const [soundVibration, setSoundVibration] = useState(true);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('gym_paglu_notif_settings');
        if (stored) {
          const cfg = JSON.parse(stored);
          if (cfg.dueReminders !== undefined) setDueReminders(cfg.dueReminders);
          if (cfg.overdueAlerts !== undefined) setOverdueAlerts(cfg.overdueAlerts);
          if (cfg.paymentReceipts !== undefined) setPaymentReceipts(cfg.paymentReceipts);
          if (cfg.checkinAlerts !== undefined) setCheckinAlerts(cfg.checkinAlerts);
          if (cfg.dailySummary !== undefined) setDailySummary(cfg.dailySummary);
          if (cfg.whatsappAlerts !== undefined) setWhatsappAlerts(cfg.whatsappAlerts);
          if (cfg.smsGateway !== undefined) setSmsGateway(cfg.smsGateway);
          if (cfg.soundVibration !== undefined) setSoundVibration(cfg.soundVibration);
        }
      }
    } catch (e) {
      console.warn('Failed to load notification settings', e);
    }
  }, []);

  const saveSettings = (updated: Record<string, boolean>) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = {
          dueReminders,
          overdueAlerts,
          paymentReceipts,
          checkinAlerts,
          dailySummary,
          whatsappAlerts,
          smsGateway,
          soundVibration,
          ...updated,
        };
        window.localStorage.setItem('gym_paglu_notif_settings', JSON.stringify(current));
        setToastMsg('Notification preferences updated');
        setTimeout(() => setToastMsg(null), 2500);
      }
    } catch (e) {
      console.warn('Failed to save notification settings', e);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Toast Feedback Banner */}
      {toastMsg && (
        <View style={styles.toastBanner}>
          <CheckCircleIcon size={16} color="#16A34A" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment & Fee Alerts Section */}
        <View style={styles.sectionHeader}>
          <WalletIcon size={18} color="#0F172A" />
          <Text style={styles.sectionTitle}>Payment & Fee Notifications</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Due Payment Reminders</Text>
              <Text style={styles.settingDesc}>
                Alert owner 2 days before a member fee is due
              </Text>
            </View>
            <Switch
              value={dueReminders}
              onValueChange={val => {
                setDueReminders(val);
                saveSettings({ dueReminders: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={dueReminders ? '#F59E0B' : '#94A3B8'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Overdue Payment Alerts</Text>
              <Text style={styles.settingDesc}>
                Urgent notification when member payments become overdue
              </Text>
            </View>
            <Switch
              value={overdueAlerts}
              onValueChange={val => {
                setOverdueAlerts(val);
                saveSettings({ overdueAlerts: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={overdueAlerts ? '#F59E0B' : '#94A3B8'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto Payment Receipts</Text>
              <Text style={styles.settingDesc}>
                Generate digital confirmation receipt when fee is settled
              </Text>
            </View>
            <Switch
              value={paymentReceipts}
              onValueChange={val => {
                setPaymentReceipts(val);
                saveSettings({ paymentReceipts: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={paymentReceipts ? '#F59E0B' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Attendance & Activity */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <ClockIcon size={18} color="#0F172A" />
          <Text style={styles.sectionTitle}>Attendance & Check-Ins</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Check-In Push Alerts</Text>
              <Text style={styles.settingDesc}>
                Real-time alert when a member scans in via biometric device
              </Text>
            </View>
            <Switch
              value={checkinAlerts}
              onValueChange={val => {
                setCheckinAlerts(val);
                saveSettings({ checkinAlerts: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={checkinAlerts ? '#F59E0B' : '#94A3B8'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Daily Attendance Summary</Text>
              <Text style={styles.settingDesc}>
                Daily closing briefing at 10:00 PM with headcounts
              </Text>
            </View>
            <Switch
              value={dailySummary}
              onValueChange={val => {
                setDailySummary(val);
                saveSettings({ dailySummary: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={dailySummary ? '#F59E0B' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Channels & Delivery */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <SmartphoneIcon size={18} color="#0F172A" />
          <Text style={styles.sectionTitle}>Delivery Channels</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>WhatsApp Automated Alerts</Text>
              <Text style={styles.settingDesc}>
                Send fee reminders directly to member's WhatsApp
              </Text>
            </View>
            <Switch
              value={whatsappAlerts}
              onValueChange={val => {
                setWhatsappAlerts(val);
                saveSettings({ whatsappAlerts: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={whatsappAlerts ? '#F59E0B' : '#94A3B8'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>SMS Gateway Backup</Text>
              <Text style={styles.settingDesc}>
                Send cellular SMS if WhatsApp delivery is unavailable
              </Text>
            </View>
            <Switch
              value={smsGateway}
              onValueChange={val => {
                setSmsGateway(val);
                saveSettings({ smsGateway: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={smsGateway ? '#F59E0B' : '#94A3B8'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sound & In-App Haptics</Text>
              <Text style={styles.settingDesc}>
                Play chime on successful check-ins and fee settlement
              </Text>
            </View>
            <Switch
              value={soundVibration}
              onValueChange={val => {
                setSoundVibration(val);
                saveSettings({ soundVibration: val });
              }}
              trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
              thumbColor={soundVibration ? '#F59E0B' : '#94A3B8'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  toastText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#166534',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  settingDesc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
});
