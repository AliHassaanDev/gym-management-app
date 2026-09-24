import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
} from '../components/ui/Icons';

interface NotificationItem {
  id: string;
  icon: any;
  iconBg: string;
  title: string;
  message: string;
  time: string;
}

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications: NotificationItem[] = [
    {
      id: '1',
      icon: <WalletIcon size={18} color="#16A34A" />,
      iconBg: '#DCFCE7',
      title: 'Payment Received',
      message: 'Hassan Ahmed paid PKR 3,000',
      time: '2h ago',
    },
    {
      id: '2',
      icon: <AlertCircleIcon size={18} color="#DC2626" />,
      iconBg: '#FEE2E2',
      title: 'Overdue Payment',
      message: 'Usman Tariq is 2 days overdue',
      time: '4h ago',
    },
    {
      id: '3',
      icon: <UserPlusIcon size={18} color="#2563EB" />,
      iconBg: '#DBEAFE',
      title: 'New Member',
      message: 'Sana Khan joined the gym',
      time: '5h ago',
    },
    {
      id: '4',
      icon: <CheckCircleIcon size={18} color="#16A34A" />,
      iconBg: '#DCFCE7',
      title: 'Attendance Marked',
      message: 'Ali Raza checked in',
      time: '6h ago',
    },
    {
      id: '5',
      icon: <BellIcon size={18} color="#7C3AED" />,
      iconBg: '#EDE9FE',
      title: 'Reminder',
      message: 'Monthly payment due in 2 days',
      time: '1d ago',
    },
    {
      id: '6',
      icon: <SmartphoneIcon size={18} color="#0284C7" />,
      iconBg: '#E0F2FE',
      title: 'System Update',
      message: 'Biometric device connected',
      time: '1d ago',
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header matching Screen 11 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listCard}>
          {notifications.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.notifItem,
                index === notifications.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                {item.icon}
              </View>

              <View style={styles.infoCol}>
                <View style={styles.topRow}>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            </View>
          ))}
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
    paddingBottom: 16,
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
  content: {
    padding: 16,
    paddingBottom: 40,
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
});
