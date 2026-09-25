import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
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
  SlidersIcon,
} from '../components/ui/Icons';
import { NotificationService, AppNotification } from '../services/NotificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'payment' | 'attendance' | 'member' | 'system'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadNotifications = useCallback(() => {
    const list = NotificationService.getAll();
    setNotifications(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead();
    loadNotifications();
    setToastMsg('All notifications marked as read');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleItemPress = (notif: AppNotification) => {
    if (!notif.read) {
      NotificationService.markAsRead(notif.id);
      loadNotifications();
    }
  };

  const formatRelativeTime = (isoString: string): string => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const getCategoryConfig = (category: AppNotification['category']) => {
    switch (category) {
      case 'payment':
        return {
          icon: <WalletIcon size={18} color="#16A34A" />,
          bg: '#DCFCE7',
          tag: 'Fee',
          tagColor: '#166534',
          tagBg: '#F0FDF4',
        };
      case 'attendance':
        return {
          icon: <CheckCircleIcon size={18} color="#2563EB" />,
          bg: '#DBEAFE',
          tag: 'Attendance',
          tagColor: '#1E40AF',
          tagBg: '#EFF6FF',
        };
      case 'member':
        return {
          icon: <UserPlusIcon size={18} color="#D97706" />,
          bg: '#FEF3C7',
          tag: 'Member',
          tagColor: '#92400E',
          tagBg: '#FFFBEB',
        };
      case 'system':
      default:
        return {
          icon: <SmartphoneIcon size={18} color="#0284C7" />,
          bg: '#E0F2FE',
          tag: 'System',
          tagColor: '#075985',
          tagBg: '#F0F9FF',
        };
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeftIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings/notifications' as any)}
          activeOpacity={0.7}
        >
          <SlidersIcon size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Toast Feedback Banner */}
      {toastMsg && (
        <View style={styles.toastBanner}>
          <CheckCircleIcon size={16} color="#16A34A" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'payment', 'attendance', 'member', 'system'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === tab && styles.filterChipTextActive,
                ]}
              >
                {tab === 'all'
                  ? 'All Alerts'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sub-header with quick actions */}
      <View style={styles.subHeader}>
        <Text style={styles.alertCountText}>
          {filtered.length} notification{filtered.length === 1 ? '' : 's'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <BellIcon size={32} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              Notifications regarding member enrollments, fee dues, payments, and check-ins will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {filtered.map((item, index) => {
              const cfg = getCategoryConfig(item.category);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifItem,
                    !item.read && styles.unreadNotifItem,
                    index === filtered.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
                    {cfg.icon}
                  </View>

                  <View style={styles.infoCol}>
                    <View style={styles.topRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
                        <Text style={[styles.titleText, !item.read && styles.unreadTitleText]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {!item.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.timeText}>{formatRelativeTime(item.created_at)}</Text>
                    </View>

                    <Text style={styles.messageText}>{item.message}</Text>

                    <View style={styles.bottomMeta}>
                      <View style={[styles.categoryTag, { backgroundColor: cfg.tagBg }]}>
                        <Text style={[styles.categoryTagText, { color: cfg.tagColor }]}>
                          {cfg.tag}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  unreadBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  unreadBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: '#D97706',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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

  filterRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#F59E0B',
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

  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  alertCountText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#94A3B8',
  },
  markReadText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#2563EB',
  },

  content: {
    paddingHorizontal: 16,
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
  unreadNotifItem: {
    backgroundColor: '#FFFDF7',
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
    marginBottom: 4,
  },
  titleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#334155',
  },
  unreadTitleText: {
    fontFamily: Fonts.bold,
    color: '#0F172A',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  messageText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  bottomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categoryTagText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
