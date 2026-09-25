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
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, Shadow } from '../../../constants/theme';
import { PaymentRepository, Payment } from '../../../db/repositories/PaymentRepository';
import {
  ChevronLeftIcon,
  WalletIcon,
  TrendingUpIcon,
  CreditCardIcon,
  ChevronRightIcon,
} from '../../../components/ui/Icons';
import { getMemberAvatar } from '../../../constants/mockAvatars';
import { formatPKR, formatDate } from '../../../utils/helpers';

export default function RevenueScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'6m' | 'year' | 'all'>('6m');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);

  const [analytics, setAnalytics] = useState(() => PaymentRepository.getRevenueAnalytics('6m'));

  const loadData = useCallback(() => {
    PaymentRepository.refreshOverdueStatuses();
    const data = PaymentRepository.getRevenueAnalytics(timeframe);
    setAnalytics(data);
    if (data.monthsData.length > 0 && selectedMonthIdx === null) {
      setSelectedMonthIdx(data.monthsData.length - 1);
    }
  }, [timeframe, selectedMonthIdx]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  }, [loadData]);

  // Dynamic Chart Calculations
  const monthsData = analytics.monthsData;
  const values = monthsData.map(m => m.total);
  const maxVal = Math.max(...values, 300000);
  const minVal = Math.min(...values, 100000);

  const chartWidth = 320;
  const chartHeight = 130;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 20;
  const usableW = chartWidth - paddingX * 2;
  const usableH = chartHeight - paddingTop - paddingBottom;

  const points = monthsData.map((m, idx) => {
    const x = paddingX + (idx / Math.max(monthsData.length - 1, 1)) * usableW;
    const norm = (m.total - minVal) / Math.max(maxVal - minVal, 1);
    const y = paddingTop + (1 - norm) * usableH;
    return { x, y, ...m };
  });

  // Smooth bezier curve construction
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let p = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      p += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return p;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  const activeMonth = selectedMonthIdx !== null && points[selectedMonthIdx]
    ? points[selectedMonthIdx]
    : points[points.length - 1];

  // Donut chart math
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.0
  const memPct = analytics.membershipPct / 100;
  const ptPct = analytics.ptPct / 100;
  const memStrokeDash = `${memPct * circumference} ${circumference}`;
  const ptStrokeDash = `${ptPct * circumference} ${circumference}`;
  const ptOffset = -(memPct * circumference);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Revenue & Finances</Text>
          <Text style={styles.headerSub}>Live collections & performance</Text>
        </View>
        <TouchableOpacity
          style={styles.duesShortcutBtn}
          onPress={() => router.push('/revenue/payment-status')}
          activeOpacity={0.8}
        >
          <WalletIcon size={16} color="#0F172A" />
          <Text style={styles.duesShortcutText}>Dues</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Main Revenue Metric Card */}
        <View style={styles.chartCard}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.chartMetricLabel}>Total Revenue Collected</Text>
              <Text style={styles.chartMetricValue}>{formatPKR(analytics.totalCollected)}</Text>
            </View>
            <View style={styles.ratePill}>
              <TrendingUpIcon size={14} color="#16A34A" />
              <Text style={styles.ratePillText}>{analytics.collectionRate}% Paid</Text>
            </View>
          </View>

          {/* Interactive Month Tooltip */}
          {activeMonth && (
            <View style={styles.activeMonthBanner}>
              <Text style={styles.activeMonthTitle}>{activeMonth.label} Revenue:</Text>
              <Text style={styles.activeMonthAmt}>{formatPKR(activeMonth.total)}</Text>
            </View>
          )}

          {/* Dynamic Smooth Curved Chart */}
          <View style={styles.svgContainer}>
            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <Defs>
                <LinearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Area fill */}
              {areaPath ? <Path d={areaPath} fill="url(#goldGradient)" /> : null}

              {/* Smooth Line Curve */}
              {linePath ? (
                <Path
                  d={linePath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
              ) : null}

              {/* Data points */}
              {points.map((pt, idx) => {
                const isSelected = selectedMonthIdx === idx;
                return (
                  <Circle
                    key={pt.month}
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6.5 : 4}
                    fill={isSelected ? '#0F172A' : '#F59E0B'}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              })}
            </Svg>

            {/* X-Axis Month Selectors */}
            <View style={styles.monthsRow}>
              {points.map((pt, idx) => {
                const isSelected = selectedMonthIdx === idx;
                return (
                  <TouchableOpacity
                    key={pt.month}
                    style={[styles.monthChip, isSelected && styles.monthChipActive]}
                    onPress={() => setSelectedMonthIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.monthLabel, isSelected && styles.monthLabelActive]}>
                      {pt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 3 KPI Financial Snapshot Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Collected</Text>
            <Text style={[styles.kpiValue, { color: '#16A34A' }]}>
              {formatPKR(analytics.totalCollected)}
            </Text>
            <Text style={styles.kpiSub}>Settled in full</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pending Dues</Text>
            <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
              {formatPKR(analytics.pendingDues)}
            </Text>
            <Text style={styles.kpiSub}>Unpaid member fees</Text>
          </View>
        </View>

        {/* Revenue Breakdown by Category (Dynamic Donut) */}
        <Text style={styles.sectionHeading}>Revenue by Membership Type</Text>
        <View style={styles.donutCard}>
          <View style={styles.donutWrapper}>
            <Svg width={130} height={130} viewBox="0 0 130 130">
              <G transform="rotate(-90 65 65)">
                {/* Background Ring */}
                <Circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth="14"
                  fill="none"
                />
                {/* 1. Membership (Amber) */}
                <Circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={memStrokeDash}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  fill="none"
                />
                {/* 2. Personal Training (Blue) */}
                <Circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#3B82F6"
                  strokeWidth="14"
                  strokeDasharray={ptStrokeDash}
                  strokeDashoffset={ptOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            </Svg>

            {/* Inner Center Label */}
            <View style={styles.donutCenter}>
              <Text style={styles.centerSmall}>Total</Text>
              <Text style={styles.centerBig}>{analytics.collectionRate}%</Text>
            </View>
          </View>

          {/* Legend Items */}
          <View style={styles.legendCol}>
            {/* General Membership */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendName}>General Memberships</Text>
                <Text style={styles.legendAmt}>{formatPKR(analytics.membershipAmt)}</Text>
              </View>
              <Text style={styles.legendPct}>{analytics.membershipPct}%</Text>
            </View>

            <View style={styles.divider} />

            {/* Personal Training */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendName}>Personal Training</Text>
                <Text style={styles.legendAmt}>{formatPKR(analytics.ptAmt)}</Text>
              </View>
              <Text style={styles.legendPct}>{analytics.ptPct}%</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods Breakdown */}
        <Text style={styles.sectionHeading}>Payment Methods</Text>
        <View style={styles.methodCard}>
          <View style={styles.methodBarWrapper}>
            <View style={[styles.methodBarSegment, { flex: Math.max(analytics.cashPct, 5), backgroundColor: '#10B981' }]} />
            <View style={[styles.methodBarSegment, { flex: Math.max(analytics.onlinePct, 5), backgroundColor: '#6366F1' }]} />
          </View>

          <View style={styles.methodDetailsRow}>
            <View style={styles.methodCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.methodName}>Cash Payments</Text>
              </View>
              <Text style={styles.methodVal}>{formatPKR(analytics.cashTotal)} ({analytics.cashPct}%)</Text>
            </View>

            <View style={styles.methodCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
                <Text style={styles.methodName}>Online / Bank</Text>
              </View>
              <Text style={styles.methodVal}>{formatPKR(analytics.onlineTotal)} ({analytics.onlinePct}%)</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions Feed */}
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionHeading}>Recent Paid Receipts</Text>
          <TouchableOpacity onPress={() => router.push('/revenue/payment-status')} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>View All Statuses →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txCard}>
          {analytics.recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No settled payments recorded yet</Text>
          ) : (
            analytics.recentTransactions.map((tx, idx) => {
              const avatar = getMemberAvatar(tx.member_name ?? 'Member', tx.photo_uri);
              return (
                <View
                  key={tx.id}
                  style={[
                    styles.txItem,
                    idx === analytics.recentTransactions.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Image source={{ uri: avatar }} style={styles.txAvatar} />
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.txMemberName}>{tx.member_name ?? 'Member'}</Text>
                    <Text style={styles.txDate}>
                      {tx.paid_at ? formatDate(tx.paid_at) : 'Paid'} · {tx.payment_method === 'cash' ? '💵 Cash' : '🏦 Online'}
                    </Text>
                  </View>
                  <Text style={styles.txAmount}>{formatPKR(tx.amount)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

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
  headerLeft: { flex: 1 },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  headerSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  duesShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  duesShortcutText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    ...Shadow.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chartMetricLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  chartMetricValue: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: '#0F172A',
    marginTop: 2,
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  ratePillText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#16A34A',
  },

  activeMonthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeMonthTitle: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#475569',
  },
  activeMonthAmt: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#D97706',
  },

  svgContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  monthChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  monthChipActive: {
    backgroundColor: '#0F172A',
  },
  monthLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  monthLabelActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },

  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadow.sm,
  },
  kpiLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
  },
  kpiValue: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    marginTop: 4,
  },
  kpiSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },

  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 10,
  },

  donutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    ...Shadow.sm,
  },
  donutWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSmall: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  centerBig: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#0F172A',
  },

  legendCol: { flex: 1 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendName: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#334155',
  },
  legendAmt: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  legendPct: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    ...Shadow.sm,
  },
  methodBarWrapper: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  methodBarSegment: {
    height: '100%',
  },
  methodDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodCol: {
    flex: 1,
  },
  methodName: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#334155',
  },
  methodVal: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#0F172A',
    marginTop: 4,
  },

  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  seeAllText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#2563EB',
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  txAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  txMemberName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  txDate: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  txAmount: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#16A34A',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
