import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';
import { MemberRepository } from '../../db/repositories/MemberRepository';
import { PaymentRepository } from '../../db/repositories/PaymentRepository';
import { AttendanceRepository } from '../../db/repositories/AttendanceRepository';
import {
  UsersIcon,
  WalletIcon,
  UserPlusIcon,
  FingerprintIcon,
  ChartIcon,
  BellIcon,
  ArrowRightIcon,
} from '../../components/ui/Icons';
import { OWNER_AVATAR, ATHLETE_BANNER_IMAGE } from '../../constants/mockAvatars';
import { formatPKR } from '../../utils/helpers';

import { NotificationService } from '../../services/NotificationService';

export default function DashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMembers: 128,
    monthlyRevenue: 256000,
    paid: 102,
    due: 18,
    overdue: 8,
    todayAttendance: 24,
  });
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(() => {
    setUnreadNotifCount(NotificationService.getUnreadCount());
    const members = MemberRepository.getAll();
    const paid = members.filter(m => m.payment_status === 'paid').length;
    const due = members.filter(m => m.payment_status === 'due').length;
    const overdue = members.filter(m => m.payment_status === 'overdue').length;
    const rev = PaymentRepository.getCurrentMonthRevenue();
    const att = AttendanceRepository.getTodayCount();

    setStats({
      totalMembers: members.length,
      monthlyRevenue: rev,
      paid: paid,
      due: due,
      overdue: overdue,
      todayAttendance: att,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
    setRefreshing(false);
  }, [loadStats]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Top Header matching Screen 2 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingSub}>Good Morning,</Text>
            <Text style={styles.greetingMain}>Ali Raza 👋</Text>
            <Text style={styles.greetingQuote}>Keep going. Stronger every day.</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/notifications' as any)}
              activeOpacity={0.7}
            >
              <BellIcon size={22} color="#0F172A" />
              {unreadNotifCount > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/more')}
              activeOpacity={0.8}
            >
              <Image source={{ uri: OWNER_AVATAR }} style={styles.avatarImg} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2 Dark Stat Cards side-by-side */}
        <View style={styles.statsRow}>
          {/* Total Members */}
          <TouchableOpacity
            style={styles.darkCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/members')}
          >
            <View style={styles.cardIconBox}>
              <UsersIcon size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.darkCardLabel}>Total Members</Text>
            <Text style={styles.darkCardValue}>{stats.totalMembers}</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>↑ 12%</Text>
              <Text style={styles.trendMuted}>vs. last month</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly Revenue */}
          <TouchableOpacity
            style={styles.darkCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/revenue')}
          >
            <View style={styles.cardIconBox}>
              <WalletIcon size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.darkCardLabel}>Monthly Revenue</Text>
            <Text style={styles.darkCardValueRevenue}>{formatPKR(stats.monthlyRevenue)}</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendGreen}>↑ 18%</Text>
              <Text style={styles.trendMuted}>vs. last month</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Status Summary Row (Paid, Due, Overdue) */}
        <View style={styles.statusSummaryCard}>
          <TouchableOpacity
            style={styles.statusCol}
            onPress={() => router.push('/revenue/payment-status?tab=paid')}
            activeOpacity={0.7}
          >
            <View style={styles.statusLabelRow}>
              <View style={[styles.dot, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.statusLabel}>Paid</Text>
            </View>
            <Text style={[styles.statusNum, { color: '#0F172A' }]}>{stats.paid}</Text>
          </TouchableOpacity>

          <View style={styles.statusDivider} />

          <TouchableOpacity
            style={styles.statusCol}
            onPress={() => router.push('/revenue/payment-status?tab=due')}
            activeOpacity={0.7}
          >
            <View style={styles.statusLabelRow}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statusLabel}>Due</Text>
            </View>
            <Text style={[styles.statusNum, { color: '#0F172A' }]}>{stats.due}</Text>
          </TouchableOpacity>

          <View style={styles.statusDivider} />

          <TouchableOpacity
            style={styles.statusCol}
            onPress={() => router.push('/revenue/payment-status?tab=overdue')}
            activeOpacity={0.7}
          >
            <View style={styles.statusLabelRow}>
              <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.statusLabel}>Overdue</Text>
            </View>
            <Text style={[styles.statusNum, { color: '#0F172A' }]}>{stats.overdue}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Header & 3-card Row */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {/* Add Member */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/members/add')}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconCircle}>
                <UserPlusIcon size={22} color="#0F172A" />
              </View>
              <Text style={styles.actionLabel}>Add Member</Text>
            </TouchableOpacity>

            {/* Mark Attendance */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/attendance')}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconCircle}>
                <FingerprintIcon size={22} color="#0F172A" />
              </View>
              <Text style={styles.actionLabel}>Mark Attendance</Text>
            </TouchableOpacity>

            {/* View Reports */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/reports' as any)}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconCircle}>
                <ChartIcon size={22} color="#0F172A" />
              </View>
              <Text style={styles.actionLabel}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Healthy Members Motivational Banner matching Screen 2 */}
        <TouchableOpacity
          style={styles.communityBanner}
          activeOpacity={0.88}
          onPress={() => router.push('/(tabs)/members')}
        >
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>Healthy Members</Text>
            <Text style={styles.bannerTitle}>Build a Stronger</Text>
            <Text style={styles.bannerTitleHighlight}>Community</Text>
          </View>

          <Image
            source={{ uri: ATHLETE_BANNER_IMAGE }}
            style={styles.bannerAthleteImg}
            resizeMode="cover"
          />

          <View style={styles.bannerActionBtn}>
            <ArrowRightIcon size={16} color="#0F172A" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 4,
  },
  headerLeft: { flex: 1 },
  greetingSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  greetingMain: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#0F172A',
    marginTop: 1,
  },
  greetingQuote: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadow.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadow.sm,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  darkCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadow.darkCard,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  darkCardLabel: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  darkCardValue: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  darkCardValueRevenue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendGreen: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: '#22C55E',
  },
  trendMuted: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
  },

  statusSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  statusCol: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  statusNum: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  statusDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    height: '80%',
    alignSelf: 'center',
  },

  quickActionsSection: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#0F172A',
    textAlign: 'center',
  },

  communityBanner: {
    height: 124,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    ...Shadow.darkCard,
  },
  bannerInfo: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  bannerTitleHighlight: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#F59E0B',
    lineHeight: 20,
  },
  bannerAthleteImg: {
    width: 110,
    height: 124,
    position: 'absolute',
    right: 54,
    top: 0,
    opacity: 0.85,
  },
  bannerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    ...Shadow.sm,
  },
});
