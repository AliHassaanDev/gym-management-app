import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Shadow } from '../constants/theme';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UserPlusIcon,
  BellIcon,
  SmartphoneIcon,
  WalletIcon,
  ClockIcon,
} from '../components/ui/Icons';
import { getDB } from '../db/database';

interface NotificationItem {
  id: string;
  category: 'payment' | 'attendance' | 'system' | 'member';
  icon: any;
  iconBg: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: 'payment',
    icon: <WalletIcon size={18} color="#16A34A" />,
    iconBg: '#DCFCE7',
    title: 'Payment Received',
    message: 'Hassan Ahmed paid PKR 3,000 via Cash',
    time: '25m ago',
    read: false,
  },
  {
    id: '2',
    category: 'payment',
    icon: <AlertCircleIcon size={18} color="#DC2626" />,
    iconBg: '#FEE2E2',
    title: 'Overdue Fee Notice',
    message: 'Usman Tariq is 2 days overdue (PKR 3,000)',
    time: '2h ago',
    read: false,
  },
  {
    id: '3',
    category: 'member',
    icon: <UserPlusIcon size={18} color="#2563EB" />,
    iconBg: '#DBEAFE',
    title: 'New Member Enrolled',
    message: 'Sana Khan joined Monthly Standard Plan',
    time: '4h ago',
    read: true,
  },
  {
    id: '4',
    category: 'attendance',
    icon: <CheckCircleIcon size={18} color="#16A34A" />,
    iconBg: '#DCFCE7',
    title: 'Attendance Check-In',
    message: 'Ali Raza checked in via Biometric Scanner',
    time: '6h ago',
    read: true,
  },
  {
    id: '5',
    category: 'payment',
    icon: <BellIcon size={18} color="#D97706" />,
    iconBg: '#FEF3C7',
    title: 'Upcoming Fee Reminder',
    message: '3 members have fees due within next 48 hours',
    time: '1d ago',
    read: true,
  },
  {
    id: '6',
    category: 'system',
    icon: <SmartphoneIcon size={18} color="#0284C7" />,
    iconBg: '#E0F2FE',
    title: 'Biometric System Connected',
    message: 'ZK-Teco device synced successfully on LAN',
    time: '2d ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'alerts'>('settings');

  // Toggle settings
  const [dueReminders, setDueReminders] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [paymentReceipts, setPaymentReceipts] = useState(true);
  const [checkinAlerts, setCheckinAlerts] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsGateway, setSmsGateway] = useState(false);
  const [soundVibration, setSoundVibration] = useState(true);

  // Filter state for alerts
  const [alertFilter, setAlertFilter] = useState<'all' | 'payment' | 'attendance' | 'system'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted settings if available
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

  const savePreferences = (updated: Record<string, boolean>) => {
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
        setSavedBanner('Settings saved');
        setTimeout(() => setSavedBanner(null), 2500);
      }
    } catch (e) {
      console.warn('Failed to save notification settings', e);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setSavedBanner('All notifications marked as read');
    setTimeout(() => setSavedBanner(null), 2500);
  };

  const filteredNotifs = notifications.filter(n => {
    if (alertFilter === 'all') return true;
    return n.category === alertFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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

      {/* Segmented Switch: Settings vs Recent Alerts */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'settings' && styles.activeTabButtonText]}>
            Preferences
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'alerts' && styles.activeTabButton]}
          onPress={() => setActiveTab('alerts')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'alerts' && styles.activeTabButtonText]}>
            Recent Alerts {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Notification Banner */}
      {savedBanner && (
        <View style={styles.toastBanner}>
          <CheckCircleIcon size={16} color="#16A34A" />
          <Text style={styles.toastText}>{savedBanner}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'settings' ? (
          <>
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
                    savePreferences({ dueReminders: val });
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
                    savePreferences({ overdueAlerts: val });
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
                    Generate digital confirmation when fee is settled
                  </Text>
                </View>
                <Switch
                  value={paymentReceipts}
                  onValueChange={val => {
                    setPaymentReceipts(val);
                    savePreferences({ paymentReceipts: val });
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
                  thumbColor={paymentReceipts ? '#F59E0B' : '#94A3B8'}
                />
              </View>
            </View>

            {/* Attendance & Activity */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <ClockIcon size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>Attendance & Check-Ins</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Check-In Push Alerts</Text>
                  <Text style={styles.settingDesc}>
                    Show real-time alert on owner screen when member scans in
                  </Text>
                </View>
                <Switch
                  value={checkinAlerts}
                  onValueChange={val => {
                    setCheckinAlerts(val);
                    savePreferences({ checkinAlerts: val });
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
                    savePreferences({ dailySummary: val });
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
                  thumbColor={dailySummary ? '#F59E0B' : '#94A3B8'}
                />
              </View>
            </View>

            {/* Channels & Delivery */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
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
                    savePreferences({ whatsappAlerts: val });
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
                    savePreferences({ smsGateway: val });
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
                    Play chime on successful member check-in & fee settlement
                  </Text>
                </View>
                <Switch
                  value={soundVibration}
                  onValueChange={val => {
                    setSoundVibration(val);
                    savePreferences({ soundVibration: val });
                  }}
                  trackColor={{ false: '#E2E8F0', true: '#FDE68A' }}
                  thumbColor={soundVibration ? '#F59E0B' : '#94A3B8'}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['all', 'payment', 'attendance', 'system'] as const).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, alertFilter === tab && styles.filterChipActive]}
                  onPress={() => setAlertFilter(tab)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      alertFilter === tab && styles.filterChipTextActive,
                    ]}
                  >
                    {tab === 'all'
                      ? 'All Alerts'
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Bar */}
            <View style={styles.alertActionBar}>
              <Text style={styles.alertCountText}>
                Showing {filteredNotifs.length} notifications
              </Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
                  <Text style={styles.markReadText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            <View style={styles.listCard}>
              {filteredNotifs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <BellIcon size={32} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No alerts found for this category</Text>
                </View>
              ) : (
                filteredNotifs.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.notifItem,
                      !item.read && styles.unreadNotifItem,
                      index === filteredNotifs.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                      {item.icon}
                    </View>

                    <View style={styles.infoCol}>
                      <View style={styles.topRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.titleText}>{item.title}</Text>
                          {!item.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.timeText}>{item.time}</Text>
                      </View>
                      <Text style={styles.messageText}>{item.message}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
    paddingBottom: 12,
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

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  activeTabButton: {
    backgroundColor: '#0F172A',
  },
  tabButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
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

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#0F172A',
    fontFamily: Fonts.bold,
  },

  alertActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  alertCountText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  markReadText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#2563EB',
  },

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  unreadNotifItem: {
    backgroundColor: '#F8FAFC',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCol: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  titleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  messageText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#94A3B8',
  },
});
